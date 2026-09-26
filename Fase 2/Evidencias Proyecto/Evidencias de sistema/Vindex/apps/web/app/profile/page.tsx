"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
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

type SellerProduct = {
  id: number;
  name: string | null;
  description: string | null;
  price: number | null;
  stock: number | null;
  images: string[] | null;
  discount_price: number | null;
  offer_ends_at: string | null;
  created_at: string;
};

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  stock: string;
  discountPrice: string;
  offerDurationHours: string;
  renewOffer: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  // Estado para alternar entre perfil de Comprador y Vendedor
  const [activeRole, setActiveRole] = useState<"buyer" | "seller">("buyer");

  // Estados de datos personales
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerProductsLoading, setSellerProductsLoading] = useState(true);
  const [sellerProductsError, setSellerProductsError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [productSaveMessage, setProductSaveMessage] = useState<string | null>(null);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);

  // Estados de dirección
  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [comuna, setComuna] = useState("");
  const [calle, setCalle] = useState("");
  const [observacion, setObservacion] = useState("");

  // Tiendas simuladas (Mock para desarrollo inicial)
  const [stores, setStores] = useState([
  ]);

  // Formulario simple para crear tienda
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreDesc, setNewStoreDesc] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!isCurrent) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      const metadata = user.user_metadata ?? {};
      const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
      const nameParts = fullName.split(/\s+/);

      setEmail(user.email ?? "");
      setFirstName(typeof metadata.first_name === "string" ? metadata.first_name : nameParts[0] ?? "");
      setLastName(typeof metadata.last_name === "string" ? metadata.last_name : nameParts.slice(1).join(" "));
      setRegion(typeof metadata.region === "string" ? metadata.region : "");
      setCiudad(typeof metadata.ciudad === "string" ? metadata.ciudad : "");
      setComuna(typeof metadata.comuna === "string" ? metadata.comuna : "");
      setCalle(typeof metadata.calle === "string" ? metadata.calle : "");
      setObservacion(typeof metadata.observacion === "string" ? metadata.observacion : "");

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, description, price, stock, images, discount_price, offer_ends_at, created_at")
        .eq("seller_id", user.id)
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (!isCurrent) return;
      if (productsError) {
        setSellerProductsError(productsError.message);
      } else {
        setSellerProducts((products ?? []) as SellerProduct[]);
      }
      setSellerProductsLoading(false);
      setProfileLoading(false);
    };

    void loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [router, supabase]);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: [firstName, lastName].filter(Boolean).join(" "),
        first_name: firstName,
        last_name: lastName,
        region,
        ciudad,
        comuna,
        calle,
        observacion,
      },
    });

    if (error) {
      setProfileError(error.message);
      return;
    }

    setProfileMessage("Tus datos se guardaron correctamente.");
  };

  const startEditingProduct = (product: SellerProduct) => {
    const offerIsExpired = !product.offer_ends_at || new Date(product.offer_ends_at).getTime() <= Date.now();
    setEditingProductId(product.id);
    setProductSaveError(null);
    setProductSaveMessage(null);
    setProductDraft({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price === null ? "" : String(product.price),
      stock: product.stock === null ? "0" : String(product.stock),
      discountPrice: product.discount_price === null ? "" : String(product.discount_price),
      offerDurationHours: "24",
      renewOffer: offerIsExpired,
    });
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>, product: SellerProduct) => {
    event.preventDefault();
    if (!productDraft) return;

    setProductSaveError(null);
    setProductSaveMessage(null);
    const parsedPrice = Number(productDraft.price);
    const parsedStock = Number(productDraft.stock);
    const parsedDiscountPrice = productDraft.discountPrice.trim() ? Number(productDraft.discountPrice) : null;

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedStock) || parsedStock < 0) {
      setProductSaveError("Ingresa un precio y un stock válidos.");
      return;
    }

    if (parsedDiscountPrice !== null && (!Number.isFinite(parsedDiscountPrice) || parsedDiscountPrice >= parsedPrice)) {
      setProductSaveError("El precio de oferta debe ser estrictamente menor que el precio normal.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.replace("/login");
      return;
    }

    setSavingProductId(product.id);
    const offerEndsAt = parsedDiscountPrice === null
      ? null
      : productDraft.renewOffer || !product.offer_ends_at
        ? new Date(Date.now() + Number(productDraft.offerDurationHours) * 60 * 60 * 1000).toISOString()
        : product.offer_ends_at;

    const { error } = await supabase
      .from("products")
      .update({
        name: productDraft.name.trim(),
        description: productDraft.description.trim() || null,
        price: parsedPrice,
        stock: parsedStock,
        discount_price: parsedDiscountPrice,
        offer_ends_at: offerEndsAt,
      })
      .eq("id", product.id)
      .eq("seller_id", user.id);

    setSavingProductId(null);
    if (error) {
      setProductSaveError(error.message);
      return;
    }

    setSellerProducts((currentProducts) => currentProducts.map((currentProduct) => currentProduct.id === product.id
      ? {
          ...currentProduct,
          name: productDraft.name.trim(),
          description: productDraft.description.trim() || null,
          price: parsedPrice,
          stock: parsedStock,
          discount_price: parsedDiscountPrice,
          offer_ends_at: offerEndsAt,
        }
      : currentProduct));
    setProductSaveMessage("Los cambios del producto se guardaron.");
    setEditingProductId(null);
    setProductDraft(null);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;

    const newStore = {
      id: Date.now().toString(),
      name: newStoreName,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80",
      description: newStoreDesc || "Sin descripción",
      stats: { sales: 0, earnings: 0, inStock: 0, visits: 1 },
    };

    setStores([...stores, newStore]);
    setNewStoreName("");
    setNewStoreDesc("");
    setShowCreateStore(false);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Mi Cuenta</h1>
        <p className="text-sm text-slate-400">
          Administra tus datos personales, direcciones de despacho y tiendas activas.
        </p>
      </div>

      {profileLoading ? (
        <p role="status" className="text-sm text-slate-600">Cargando tu perfil...</p>
      ) : (
        <p className="mb-6 text-sm text-slate-700">Sesión iniciada como {email}</p>
      )}
      {profileError && <p role="alert" className="mb-4 text-sm text-red-700">{profileError}</p>}
      {profileMessage && <p role="status" className="mb-4 text-sm text-emerald-700">{profileMessage}</p>}

      {!profileLoading && <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* COLUMNA IZQUIERDA: Selector de Rol / Modo */}
        <div className="space-y-4 md:col-span-1">
          <Card className="border-slate-800 bg-slate-50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-neutral-800">Tipo de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeRole === "buyer" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeRole === "buyer" ? "bg-brand-400 hover:bg-brand-600 text-white" : "text-slate-800 hover:bg-brand-800 hover:text-white"
                }`}
                onClick={() => setActiveRole("buyer")}
              >
                Perfil Comprador
              </Button>

              <Button
                variant={activeRole === "seller" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeRole === "seller" ? "bg-brand-400 hover:bg-brand-600 text-white" : "text-slate-800 hover:bg-brand-800 hover:text-white"
                }`}
                onClick={() => setActiveRole("seller")}
              >
                Perfil Vendedor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Contenido Principal */}
        <div className="space-y-6 md:col-span-3">
          {/* MODO COMPRADOR: Datos de Usuario y Dirección */}
          {activeRole === "buyer" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Información Personal */}
              <Card className="border-slate-800 bg-slate-50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Datos Personales</CardTitle>
                  <CardDescription className="text-slate-600">
                    Modifica tu información básica de contacto en la plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dirección de Envío */}
              <Card className="border-slate-800 bg-slate-50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-bg-slate-700">Dirección de Despacho</CardTitle>
                  <CardDescription className="text-slate-400">
                    Utilizada para el cálculo de envíos y entregas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="region">Región</Label>
                      <Input
                        id="region"
                        placeholder="Metropolitana"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        placeholder="Santiago"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comuna">Comuna</Label>
                      <Input
                        id="comuna"
                        placeholder="Providencia"
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calle">Calle, Número y Depto</Label>
                    <Input
                      id="calle"
                      placeholder="Av. Providencia 1234, Depto 402"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacion">Referencias</Label>
                    <Textarea
                      id="observacion"
                      placeholder="Dejar en conserjería, timbre no funciona, etc."
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>

                  <Button type="submit" className="bg-brand-600 hover:bg-brand-800 text-white">
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </form>
          )}

          {/* ´Perfil Vendedor */}
          {activeRole === "seller" && (
            <div className="space-y-6">
              <Card className="border-slate-200 bg-surface">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Mis productos publicados</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Edita la información y administra las ofertas de tus publicaciones activas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {productSaveError && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{productSaveError}</p>}
                  {productSaveMessage && <p role="status" className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{productSaveMessage}</p>}
                  {sellerProductsError && <p role="alert" className="text-sm text-red-700">No se pudieron cargar tus productos: {sellerProductsError}</p>}
                  {sellerProductsLoading ? (
                    <p role="status" className="text-sm text-muted-foreground">Cargando tus productos...</p>
                  ) : sellerProducts.length === 0 && !sellerProductsError ? (
                    <div className="rounded-md border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">Aún no tienes productos publicados.</p>
                      <a href="/vender" className="btn btn-primary mt-4">Publicar un producto</a>
                    </div>
                  ) : (
                    sellerProducts.map((product) => {
                      const activeOffer = product.discount_price !== null && product.offer_ends_at !== null && new Date(product.offer_ends_at).getTime() > Date.now();
                      const invalidDraftDiscount = productDraft?.discountPrice.trim() !== "" && productDraft !== null && (
                        !Number.isFinite(Number(productDraft.discountPrice)) || Number(productDraft.discountPrice) >= Number(productDraft.price)
                      );

                      return (
                        <article key={product.id} className="rounded-md border border-border p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <img
                              src={product.images?.[0] ?? "https://picsum.photos/seed/vindex-product/240/240"}
                              alt={product.name ?? "Producto"}
                              className="aspect-square w-full rounded-md bg-muted object-cover sm:w-24"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-foreground">{product.name ?? "Producto sin nombre"}</h3>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(product.price ?? 0)}
                                    <span className="mx-2">·</span>Stock: {product.stock ?? 0}
                                  </p>
                                  {activeOffer && (
                                    <p className="mt-1 text-sm text-accent-600">
                                      Oferta {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(product.discount_price!)} hasta {new Date(product.offer_ends_at!).toLocaleString("es-CL")}
                                    </p>
                                  )}
                                </div>
                                {editingProductId !== product.id && (
                                  <Button type="button" variant="outline" onClick={() => startEditingProduct(product)}>
                                    Editar producto
                                  </Button>
                                )}
                              </div>
                              {product.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
                            </div>
                          </div>

                          {editingProductId === product.id && productDraft && (
                            <form onSubmit={(event) => void handleSaveProduct(event, product)} className="mt-5 space-y-4 border-t border-border pt-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor={`product-name-${product.id}`}>Nombre</Label>
                                  <Input id={`product-name-${product.id}`} value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} required maxLength={160} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor={`product-description-${product.id}`}>Descripción</Label>
                                  <Textarea id={`product-description-${product.id}`} value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} rows={3} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`product-price-${product.id}`}>Precio normal</Label>
                                  <Input id={`product-price-${product.id}`} type="number" min="0" step="any" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`product-stock-${product.id}`}>Stock</Label>
                                  <Input id={`product-stock-${product.id}`} type="number" min="0" step="any" value={productDraft.stock} onChange={(event) => setProductDraft({ ...productDraft, stock: event.target.value })} required />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor={`product-discount-${product.id}`}>Precio de oferta (opcional)</Label>
                                  <Input id={`product-discount-${product.id}`} type="number" min="0" step="any" value={productDraft.discountPrice} aria-invalid={Boolean(invalidDraftDiscount)} onChange={(event) => setProductDraft({ ...productDraft, discountPrice: event.target.value })} />
                                  {invalidDraftDiscount && <p className="text-sm text-red-700">Debe ser estrictamente menor que el precio normal.</p>}
                                </div>
                              </div>

                              <div className="space-y-3 rounded-md bg-muted/50 p-3">
                                <label className="flex items-center gap-2 text-sm text-foreground">
                                  <input type="checkbox" checked={productDraft.renewOffer} onChange={(event) => setProductDraft({ ...productDraft, renewOffer: event.target.checked })} className="h-4 w-4 accent-brand-600" />
                                  Crear o renovar la oferta desde ahora
                                </label>
                                <div className="space-y-2">
                                  <Label htmlFor={`offer-duration-${product.id}`}>Duración de la oferta</Label>
                                  <select id={`offer-duration-${product.id}`} value={productDraft.offerDurationHours} onChange={(event) => setProductDraft({ ...productDraft, offerDurationHours: event.target.value })} disabled={!productDraft.renewOffer} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="24">24 horas</option>
                                    <option value="48">48 horas</option>
                                    <option value="168">7 días</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => { setEditingProductId(null); setProductDraft(null); setProductSaveError(null); }}>
                                  Cancelar
                                </Button>
                                <Button type="submit" disabled={savingProductId === product.id || Boolean(invalidDraftDiscount)}>
                                  {savingProductId === product.id ? "Guardando..." : "Guardar cambios"}
                                </Button>
                              </div>
                            </form>
                          )}
                        </article>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {stores.length === 0 ? (
                <Card className="border-slate-200 bg-surface p-8 text-center">
                  <h3 className="text-lg font-semibold text-white">Aún no tienes tiendas creadas</h3>
                  <p className="mt-1 text-sm text-slate-800">
                    Comienza a vender o crear subastas creando tu primer espacio comercial.
                  </p>
                  <Button
                    onClick={() => setShowCreateStore(true)}
                    className="mt-4 bg-brand-600 hover:bg-brand-500 text-white"
                  >
                    Crear Primera Tienda
                  </Button>
                </Card>
              ) : (
                <>
                  {stores.map((store) => (
                    <Card key={store.id} className="border-slate-800 bg-slate-50 backdrop-blur">
                      <CardHeader className="flex flex-row items-start gap-4">
                        <img
                          src={store.image}
                          alt={store.name}
                          className="h-16 w-16 rounded-lg object-cover border border-slate-800"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-xl text-slate-700">{store.name}</CardTitle>
                          <CardDescription className="text-slate-600 mt-1">
                            {store.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Mini Dashboard de Métricas */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Ventas</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.sales}</p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Ganancias</span>
                            <p className="text-xl font-bold text-emerald-400">
                              ${store.stats.earnings.toLocaleString("es-CL")}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">En Stock</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.inStock}</p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Visitas</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.visits}</p>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                  {/* Botón para crear más tiendas al final de la lista */}
                  <div className="pt-2">
                    {!showCreateStore && (
                      <Button
                        onClick={() => setShowCreateStore(true)}
                        variant="outline"
                        className="w-full border-slate-800 text-slate-700 hover:bg-slate-300"
                      >
                        + Crear otra Tienda
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* Formulario Desplegable para Crear Tienda */}
              {showCreateStore && (
                <Card className="border-emerald-600/50 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-700">Nueva Tienda</CardTitle>
                    <CardDescription className="text-slate-400">
                      Configura el nombre y la reseña de tu nuevo espacio comercial.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleCreateStore}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Nombre de la Tienda</Label>
                        <Input
                          id="storeName"
                          placeholder="Ej: Joyería Artesanal Sol"
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          className="border-slate-800 bg-slate-50 text-slate-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storeDesc">Descripción</Label>
                        <Textarea
                          id="storeDesc"
                          placeholder="Describe lo que vendes o los remates que harás..."
                          value={newStoreDesc}
                          onChange={(e) => setNewStoreDesc(e.target.value)}
                          className="border-slate-800 bg-slate-50 text-slate-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowCreateStore(false)}
                          className="text-slate-600 border-slate-500"
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-brand-600 hover:bg-brand-800 text-white">
                          Guardar Tienda
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}