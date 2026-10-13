"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Store = { id: number; name: string; slug: string };
type StoreCategory = { id: number; name: string };
type StoreProduct = { id: number; name: string | null; sale_type: string | null; status: boolean | null; created_at: string };

export default function StoreAdminPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const storeId = Number(params.id);

  useEffect(() => {
    let current = true;

    const load = async () => {
      if (!Number.isSafeInteger(storeId) || storeId <= 0) {
        router.replace("/profile");
        return;
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.replace(`/login?next=/profile/stores/${storeId}`);
          return;
        }

        const { data: storeRow, error: storeError } = await supabase
          .from("stores")
          .select("id, name, slug")
          .eq("id", storeId)
          .eq("owner_id", user.id)
          .maybeSingle();
        if (storeError) throw storeError;
        if (!storeRow) {
          router.replace("/profile");
          return;
        }

        const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }] = await Promise.all([
          supabase.from("store_categories").select("id, name").eq("store_id", storeId).order("name", { ascending: true }),
          supabase.from("products").select("id, name, sale_type, status, created_at").eq("store_id", storeId).order("created_at", { ascending: false }),
        ]);
        if (categoryError) throw categoryError;
        if (productError) throw productError;
        if (!current) return;
        setStore(storeRow as Store);
        setCategories((categoryRows ?? []) as StoreCategory[]);
        setProducts((productRows ?? []) as StoreProduct[]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        if (current) setErrorMessage(message);
      } finally {
        if (current) setLoading(false);
      }
    };

    void load();
    return () => {
      current = false;
    };
  }, [router, storeId, supabase]);

  const addCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from("store_categories")
        .insert({ store_id: storeId, name })
        .select("id, name")
        .single();
      if (error) throw error;
      setCategories((current) => [...current, data as StoreCategory].sort((a, b) => a.name.localeCompare(b.name, "es")));
      setCategoryName("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo crear la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async (categoryId: number) => {
    const name = editingCategoryName.trim();
    if (!name) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from("store_categories")
        .update({ name })
        .eq("id", categoryId)
        .eq("store_id", storeId)
        .select("id, name")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No se encontró esa categoría en esta tienda.");
      setCategories((current) => current.map((category) => category.id === categoryId ? data as StoreCategory : category).sort((a, b) => a.name.localeCompare(b.name, "es")));
      setEditingCategoryId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: StoreCategory) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setErrorMessage(null);
    try {
      const { error } = await supabase.from("store_categories")
        .delete()
        .eq("id", category.id)
        .eq("store_id", storeId);
      if (error) throw error;
      setCategories((current) => current.filter(({ id }) => id !== category.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
    }
  };

  if (loading) return <main className="container-site py-12"><p role="status" className="text-sm text-muted-foreground">Cargando tienda...</p></main>;
  if (!store) return <main className="container-site py-12">{errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}</main>;

  return (
    <main className="container-site space-y-6 py-10">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800"><ArrowLeft className="size-4" />Volver al perfil vendedor</Link>
      <header>
        <p className="eyebrow">Administración de tienda</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{store.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">/tiendas/{store.slug}</p>
      </header>

      {errorMessage && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Categorías de la tienda</CardTitle>
          <CardDescription>Estas categorías se pueden asignar a los productos publicados en esta tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(event) => void addCategory(event)} className="flex flex-col gap-2 sm:flex-row">
            <Label htmlFor="new-category" className="sr-only">Nombre de la nueva categoría</Label>
            <Input id="new-category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ej. Accesorios" maxLength={80} required />
            <Button type="submit" disabled={saving}><Plus className="size-4" />Agregar categoría</Button>
          </form>
          {categories.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay categorías propias.</p> : (
            <ul className="divide-y divide-border">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center gap-2 py-3">
                  {editingCategoryId === category.id ? (
                    <>
                      <Input aria-label="Editar nombre de categoría" value={editingCategoryName} onChange={(event) => setEditingCategoryName(event.target.value)} className="max-w-sm" />
                      <Button type="button" size="sm" onClick={() => void saveCategory(category.id)} disabled={saving}>Guardar</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingCategoryId(null)}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-foreground">{category.name}</span>
                      <Button type="button" size="icon" variant="ghost" aria-label={`Editar ${category.name}`} onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name); }}><Pencil className="size-4" /></Button>
                      <Button type="button" size="icon" variant="ghost" aria-label={`Eliminar ${category.name}`} onClick={() => void deleteCategory(category)}><Trash2 className="size-4" /></Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos y subastas</CardTitle>
          <CardDescription>Publicaciones asignadas exclusivamente a esta tienda.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? <p className="text-sm text-muted-foreground">No hay publicaciones asignadas a esta tienda.</p> : (
            <ul className="divide-y divide-border">
              {products.map((product) => (
                <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-foreground">{product.name ?? "Publicación sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">{product.sale_type === "auction" ? "Subasta" : "Producto"} · {product.status ? "Activo" : "Inactivo"}</p>
                  </div>
                  <Link className="text-sm font-medium text-brand-700 hover:text-brand-800" href={product.sale_type === "auction" ? `/subastas/${product.id}` : `/product/${product.id}`}>Ver publicación</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
