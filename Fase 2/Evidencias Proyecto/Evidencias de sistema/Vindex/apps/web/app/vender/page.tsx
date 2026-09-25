"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type SelectedImage = {
	file: File;
	previewUrl: string;
};

const SelectedImageList = memo(function SelectedImageList({
	images,
	onRemove,
}: {
	images: SelectedImage[];
	onRemove: (previewUrl: string) => void;
}) {
	return (
		<ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
			{images.map((image) => (
				<li key={image.previewUrl} className="relative aspect-square overflow-hidden rounded-md border border-border">
					<img src={image.previewUrl} alt={image.file.name} decoding="async" className="h-full w-full object-cover" />
					<button type="button" aria-label={`Quitar ${image.file.name}`} title="Quitar imagen" onClick={() => onRemove(image.previewUrl)} className="absolute right-1 top-1 rounded-full bg-surface p-1 text-foreground shadow hover:text-brand-700">
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</li>
			))}
		</ul>
	);
});

const ProductImagePreview = memo(function ProductImagePreview({ images }: { images: SelectedImage[] }) {
	return (
		<>
			<div className="aspect-4/3 overflow-hidden rounded-lg bg-muted">
				{images[0] ? (
					<img src={images[0].previewUrl} alt={images[0].file.name} decoding="async" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
						<ImagePlus className="h-8 w-8" aria-hidden="true" />
						<span className="text-sm">Vista previa de imagen</span>
					</div>
				)}
			</div>
			{images.length > 1 && (
				<div className="mt-2 grid grid-cols-4 gap-2">
					{images.slice(1).map((image) => (
						<img key={image.previewUrl} src={image.previewUrl} alt={image.file.name} decoding="async" className="aspect-square w-full rounded-md object-cover" />
					))}
				</div>
			)}
		</>
	);
});

const convertImageToWebp = async (file: File): Promise<Blob> => {
	const bitmap = await createImageBitmap(file);
	try {
		const scale = Math.min(1, 1200 / bitmap.width, 1200 / bitmap.height);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(bitmap.width * scale));
		canvas.height = Math.max(1, Math.round(bitmap.height * scale));
		const context = canvas.getContext("2d");
		if (!context) throw new Error("No se pudo iniciar Canvas para procesar la imagen.");
		context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

		return await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => blob ? resolve(blob) : reject(new Error("No se pudo convertir la imagen a WebP.")),
				"image/webp",
				0.8,
			);
		});
	} finally {
		bitmap.close();
	}
};

const uploadProductImages = async (
	supabase: ReturnType<typeof createClient>,
	files: File[],
	userId: string,
	productId: number,
	onImageError: (message: string) => void,
): Promise<string[]> => {
	const imageUrls: string[] = [];

	for (const file of files) {
		try {
			const webpImage = await convertImageToWebp(file);
			const filePath = `${userId}/${productId || "temp"}/${crypto.randomUUID()}.webp`;
			const { error } = await supabase.storage
				.from("product-images")
				.upload(filePath, webpImage, { contentType: "image/webp" });

			if (error) throw new Error(error.message);
			imageUrls.push(supabase.storage.from("product-images").getPublicUrl(filePath).data.publicUrl);
		} catch (error) {
			const reason = error instanceof Error ? error.message : "Error desconocido";
			onImageError(`${file.name}: ${reason}`);
		}
	}

	return imageUrls;
};

const toSlug = (value: string) =>
	value
		.trim()
		.toLocaleLowerCase("es")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const createSlugSuffix = () => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
	}

	return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
};

export default function SellProductPage() {
	const router = useRouter();
	const [supabase] = useState(createClient);
	const [authorized, setAuthorized] = useState(false);
	const [name, setName] = useState("");
	const [slugSuffix, setSlugSuffix] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("1");
	const [condition, setCondition] = useState("Nuevo");
	const [categoryId, setCategoryId] = useState("");
	const [storeId, setStoreId] = useState("");
	const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
	const [isDraggingImages, setIsDraggingImages] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imagePreviewUrls = useRef(new Set<string>());
	const [isAuction, setIsAuction] = useState(false);
	const [shippingAvailable, setShippingAvailable] = useState(true);
	const [isPublished, setIsPublished] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const slug = name.trim() && slugSuffix ? `${toSlug(name)}-${slugSuffix}` : "";
	const formattedPrice = price
		? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(price))
		: "Precio por definir";

	useEffect(() => {
		let isCurrent = true;

		const verifySession = async () => {
			const { data: { user }, error } = await supabase.auth.getUser();

			if (!isCurrent) return;
			if (error || !user) {
				router.replace("/login?next=%2Fvender");
				return;
			}

			setAuthorized(true);
		};

		void verifySession();

		return () => {
			isCurrent = false;
		};
	}, [router, supabase]);

	useEffect(() => () => {
		imagePreviewUrls.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
		imagePreviewUrls.current.clear();
	}, []);

	const addImages = (files: FileList | File[]) => {
		const remainingSlots = Math.max(0, 5 - selectedImages.length);
		const images = Array.from(files)
			.filter((file) => file.type.startsWith("image/"))
			.slice(0, remainingSlots)
			.map((file) => {
				const previewUrl = URL.createObjectURL(file);
				imagePreviewUrls.current.add(previewUrl);
				return { file, previewUrl };
			});

		setSelectedImages((currentImages) => [...currentImages, ...images]);
	};

	const removeImage = useCallback((previewUrl: string) => {
		URL.revokeObjectURL(previewUrl);
		imagePreviewUrls.current.delete(previewUrl);
		setSelectedImages((currentImages) => currentImages.filter((image) => image.previewUrl !== previewUrl));
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setErrorMessage(null);
		setSuccessMessage(null);

		try {
			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) {
				router.replace("/login?next=%2Fvender");
				return;
			}

			const productSlug = slug || `${toSlug(name)}-${createSlugSuffix()}`;
			const { data: product, error: productError } = await supabase.from("products").insert({
				seller_id: user.id,
				store_id: storeId ? Number(storeId) : null,
				category_id: categoryId ? Number(categoryId) : null,
				name: name.trim(),
				slug: productSlug,
				description: description.trim() || null,
				price: Number(price),
				stock: Number(stock),
				condition,
				status: isPublished,
				images: [],
				sale_type: isAuction ? "auction" : "direct",
				is_auction: isAuction,
				shipping_available: shippingAvailable,
			}).select("id").single();

			if (productError) throw new Error(productError.message);

			const imageErrors: string[] = [];
			const imageUrls = await uploadProductImages(
				supabase,
				selectedImages.map(({ file }) => file),
				user.id,
				product.id,
				(message) => imageErrors.push(message),
			);

			if (imageUrls.length > 0) {
				const { error: imagesUpdateError } = await supabase
					.from("products")
					.update({ images: imageUrls })
					.eq("id", product.id);
				if (imagesUpdateError) imageErrors.push(`No se pudieron guardar las URLs en el producto: ${imagesUpdateError.message}`);
			}

			setSuccessMessage(imageErrors.length > 0
				? "El producto se publicó, pero algunas imágenes no pudieron procesarse."
				: "El producto se publicó correctamente.");
			if (imageErrors.length > 0) setErrorMessage(imageErrors.join(" "));
			setName("");
			setSlugSuffix(createSlugSuffix());
			setDescription("");
			setPrice("");
			setStock("1");
			setCondition("Nuevo");
			setCategoryId("");
			setStoreId("");
			selectedImages.forEach(({ previewUrl }) => {
				URL.revokeObjectURL(previewUrl);
				imagePreviewUrls.current.delete(previewUrl);
			});
			setSelectedImages([]);
			setIsAuction(false);
			setShippingAvailable(true);
			setIsPublished(true);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "No se pudo publicar el producto.");
		} finally {
			setSaving(false);
		}
	};

	if (!authorized) {
		return (
			<main className="container-site py-12">
				<p role="status" className="text-sm text-muted-foreground">Verificando sesión...</p>
			</main>
		);
	}

	return (
		<main className="container-site py-10">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-foreground">Vender un producto</h1>
				<p className="mt-2 text-sm text-muted-foreground">Completa la información y revisa cómo aparecerá tu publicación.</p>
			</div>

			{errorMessage && <p role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
			{successMessage && <p role="status" className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</p>}

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
				<section aria-labelledby="product-form-title" className="min-w-0">
					<Card>
						<CardHeader>
							<CardTitle id="product-form-title">Información del producto</CardTitle>
							<CardDescription>Completa los datos de la publicación.</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="name">Nombre</Label>
									<Input
										id="name"
										value={name}
										onChange={(event) => {
											setName(event.target.value);
											if (event.target.value.trim() && !slugSuffix) setSlugSuffix(createSlugSuffix());
										}}
										maxLength={160}
										required
									/>
								</div>
                                {/*
								<div className="space-y-2">
									<Label htmlFor="slug">Slug automático</Label>
									<Input id="slug" value={slug} readOnly aria-describedby="slug-help" />
									<p id="slug-help" className="text-xs text-muted-foreground">Se genera con el nombre y un sufijo único.</p>
								</div>
                                */}
								<div className="space-y-2">
									<Label htmlFor="description">Descripción</Label>
									<Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="price">Precio</Label>
										<Input id="price" type="number" min="0" step="any" value={price} onChange={(event) => setPrice(event.target.value)} required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="stock">Stock</Label>
										<Input id="stock" type="number" min="0" step="any" value={stock} onChange={(event) => setStock(event.target.value)} required />
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="condition">Estado del producto</Label>
									<select id="condition" value={condition} onChange={(event) => setCondition(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
										<option>Nuevo</option>
										<option>Como nuevo</option>
										<option>Usado - buen estado</option>
										<option>Usado - aceptable</option>
                                        <option>Para piezas</option>
									</select>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="categoryId">Categoría</Label>
										<select id="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
											<option value="">Categorías disponibles próximamente</option>
										</select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="storeId">Tienda</Label>
										<select id="storeId" value={storeId} onChange={(event) => setStoreId(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm">
											<option value="">Tiendas disponibles próximamente</option>
										</select>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Imágenes del producto</Label>
									<div
										className={`rounded-lg border border-dashed p-5 text-center transition ${isDraggingImages ? "border-brand-500 bg-brand-50" : "border-border bg-muted/40"}`}
										onDragOver={(event) => {
											event.preventDefault();
											setIsDraggingImages(true);
										}}
										onDragLeave={() => setIsDraggingImages(false)}
										onDrop={(event) => {
											event.preventDefault();
											setIsDraggingImages(false);
											addImages(event.dataTransfer.files);
										}}
									>
										<UploadCloud className="mx-auto mb-2 h-6 w-6 text-brand-700" aria-hidden="true" />
										<p className="text-sm font-medium text-foreground">Arrastra imágenes aquí</p>
										<p className="mt-1 text-xs text-muted-foreground">Hasta 5 imágenes. La carga a Cloudflare se integrará próximamente.</p>
										<input
											ref={imageInputRef}
											id="images"
											type="file"
											accept="image/*"
											multiple
											className="sr-only"
											onChange={(event) => {
												if (event.target.files) addImages(event.target.files);
												event.target.value = "";
											}}
										/>
										<Button type="button" variant="outline" className="mt-3" onClick={() => imageInputRef.current?.click()}>
											<ImagePlus className="h-4 w-4" aria-hidden="true" />
											Seleccionar imágenes
										</Button>
									</div>
									{selectedImages.length > 0 && (
										<SelectedImageList images={selectedImages} onRemove={removeImage} />
									)}
								</div>

								<div className="space-y-3">
									<label className="flex items-center gap-2 text-sm text-foreground">
										<input type="checkbox" checked={isAuction} onChange={(event) => setIsAuction(event.target.checked)} className="h-4 w-4 accent-brand-600" />
										Publicar como subasta
									</label>
									<label className="flex items-center gap-2 text-sm text-foreground">
										<input type="checkbox" checked={shippingAvailable} onChange={(event) => setShippingAvailable(event.target.checked)} className="h-4 w-4 accent-brand-600" />
										Envío disponible
									</label>
                                    {/*
									<label className="flex items-center gap-2 text-sm text-foreground">
										<input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="h-4 w-4 accent-brand-600" />
										Publicar inmediatamente
									</label>
                                    */}
								</div>

								<div className="flex justify-end">
									<Button type="submit" disabled={saving}>
										{saving ? "Guardando producto..." : "Publicar producto"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</section>

				<aside aria-labelledby="preview-title" className="min-w-0 lg:sticky lg:top-28">
					<Card>
						<CardHeader>
							<CardTitle id="preview-title">Vista previa</CardTitle>
							<CardDescription></CardDescription>
						</CardHeader>
						<CardContent>
							<ProductImagePreview images={selectedImages} />
							<div className="mt-5 space-y-3">
								<div className="flex flex-wrap gap-2">
									<span className="badge badge-soft">{isAuction ? "Subasta" : "Venta"}</span>
									{condition && <span className="badge bg-muted text-muted-foreground">{condition}</span>}
								</div>
								<h2 className="wrap-break-word text-xl font-bold text-foreground">{name.trim() || "Nombre del producto"}</h2>
								<p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">{description.trim() || "La descripción del producto aparecerá aquí."}</p>
								<p className="text-2xl font-extrabold text-foreground">{formattedPrice}</p>
								<div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
									<span>Stock: {stock || "0"}</span>
									<span>{shippingAvailable ? "Envío disponible" : "Sin envío"}</span>
								</div>
								{slug && <p className="break-all border-t border-border pt-3 text-xs text-muted-foreground">/{slug}</p>}
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		</main>
	);
}
