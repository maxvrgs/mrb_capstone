"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
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

const toSlug = (value: string) =>
	value
		.trim()
		.toLocaleLowerCase("es")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

export default function SellProductPage() {
	const router = useRouter();
	const [supabase] = useState(createClient);
	const [authorized, setAuthorized] = useState(false);
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("1");
	const [condition, setCondition] = useState("Nuevo");
	const [categoryId, setCategoryId] = useState("");
	const [storeId, setStoreId] = useState("");
	const [imageUrls, setImageUrls] = useState("");
	const [isAuction, setIsAuction] = useState(false);
	const [shippingAvailable, setShippingAvailable] = useState(true);
	const [isPublished, setIsPublished] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setErrorMessage(null);
		setSuccessMessage(null);

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			router.replace("/login?next=%2Fvender");
			return;
		}

		const images = imageUrls
			.split("\n")
			.map((imageUrl) => imageUrl.trim())
			.filter(Boolean);
		const hasInvalidImage = images.some((imageUrl) => {
			try {
				const parsedUrl = new URL(imageUrl);
				return parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:";
			} catch {
				return true;
			}
		});

		if (hasInvalidImage) {
			setErrorMessage("Ingresa una URL válida (http o https) por cada imagen.");
			setSaving(false);
			return;
		}

		const { error } = await supabase.from("products").insert({
			seller_id: user.id,
			store_id: storeId ? Number(storeId) : null,
			category_id: categoryId ? Number(categoryId) : null,
			name: name.trim(),
			slug: slug.trim() || toSlug(name),
			description: description.trim() || null,
			price: Number(price),
			stock: Number(stock),
			condition,
			status: isPublished,
			images,
			sale_type: isAuction ? "auction" : "direct",
			is_auction: isAuction,
			shipping_available: shippingAvailable,
		});

		setSaving(false);

		if (error) {
			setErrorMessage(error.message);
			return;
		}

		setSuccessMessage("El producto se publicó correctamente.");
		setName("");
		setSlug("");
		setDescription("");
		setPrice("");
		setStock("1");
		setCondition("Nuevo");
		setCategoryId("");
		setStoreId("");
		setImageUrls("");
		setIsAuction(false);
		setShippingAvailable(true);
		setIsPublished(true);
	};

	if (!authorized) {
		return (
			<main className="container-site py-12">
				<p role="status" className="text-sm text-muted-foreground">Verificando sesión...</p>
			</main>
		);
	}

	return (
		<main className="container-site max-w-4xl py-10">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-foreground">Vender un producto</h1>
				<p className="mt-2 text-sm text-muted-foreground">Completa la información para publicar tu producto.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Información del producto</CardTitle>
					<CardDescription>Los campos se guardan en el catálogo de productos de Vindex.</CardDescription>
				</CardHeader>
				<CardContent>
					{errorMessage && <p role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
					{successMessage && <p role="status" className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</p>}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-5 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nombre</Label>
								<Input
									id="name"
									value={name}
									onChange={(event) => {
										setName(event.target.value);
										setSlug(toSlug(event.target.value));
									}}
									maxLength={160}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="slug">Slug</Label>
								<Input id="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Descripción</Label>
							<Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
						</div>

						<div className="grid gap-5 sm:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="price">Precio</Label>
								<Input id="price" type="number" min="0" step="any" value={price} onChange={(event) => setPrice(event.target.value)} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="stock">Stock</Label>
								<Input id="stock" type="number" min="0" step="any" value={stock} onChange={(event) => setStock(event.target.value)} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="condition">Estado del producto</Label>
								<select
									id="condition"
									value={condition}
									onChange={(event) => setCondition(event.target.value)}
									className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
								>
									<option>Nuevo</option>
									<option>Como nuevo</option>
									<option>Usado - buen estado</option>
									<option>Usado - aceptable</option>
								</select>
							</div>
						</div>

						<div className="grid gap-5 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="categoryId">ID de categoría (opcional)</Label>
								<Input id="categoryId" type="number" min="1" step="1" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="storeId">ID de tienda (opcional)</Label>
								<Input id="storeId" type="number" min="1" step="1" value={storeId} onChange={(event) => setStoreId(event.target.value)} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="images">Imágenes</Label>
							<Textarea
								id="images"
								value={imageUrls}
								onChange={(event) => setImageUrls(event.target.value)}
								placeholder="https://ejemplo.cl/imagen-1.jpg"
								rows={3}
							/>
							<p className="text-xs text-muted-foreground">Ingresa una URL por línea; se almacenarán como un arreglo JSON.</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							<label className="flex items-center gap-2 text-sm text-foreground">
								<input type="checkbox" checked={isAuction} onChange={(event) => setIsAuction(event.target.checked)} className="h-4 w-4 accent-brand-600" />
								Publicar como subasta
							</label>
							<label className="flex items-center gap-2 text-sm text-foreground">
								<input type="checkbox" checked={shippingAvailable} onChange={(event) => setShippingAvailable(event.target.checked)} className="h-4 w-4 accent-brand-600" />
								Envío disponible
							</label>
							<label className="flex items-center gap-2 text-sm text-foreground">
								<input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="h-4 w-4 accent-brand-600" />
								Publicar inmediatamente
							</label>
						</div>

						<div className="flex justify-end">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando producto..." : "Publicar producto"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
