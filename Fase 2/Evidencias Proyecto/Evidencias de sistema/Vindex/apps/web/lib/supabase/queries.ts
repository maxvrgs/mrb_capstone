import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export { formatProductPrice } from "../formatters";
import type { ProductListing } from "../product-utils";
export type { ProductListing } from "../product-utils";
export { getActiveDiscountPrice, getDiscountLabel, getProductImage } from "../product-utils";

async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll: () => cookieStore.getAll(),
				setAll: (cookiesToSet) => {
					try {
						cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
					} catch {
						// Server components cannot write cookies during rendering.
					}
				},
			},
		},
	);
}

const logQueryError = (section: string, message: string) => {
	console.error(`No se pudieron cargar ${section}: ${message}`);
};

export async function getFeaturedProducts(): Promise<ProductListing[]> {
	const supabase = await createSupabaseServerClient();
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("is_featured", true)
		.gt("featured_until", now)
		.eq("status", true)
		.limit(6);

	if (error) {
		logQueryError("los productos destacados", error.message);
		return [];
	}

	return (data ?? []) as ProductListing[];
}

export async function getDailyDeals(): Promise<ProductListing[]> {
	const supabase = await createSupabaseServerClient();
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.not("discount_price", "is", null)
		.gt("offer_ends_at", now)
		.eq("status", true)
		.order("offer_ends_at", { ascending: true });

	if (error) {
		logQueryError("las ofertas", error.message);
		return [];
	}

	return (data ?? []) as ProductListing[];
}

export async function getLatestProducts(): Promise<ProductListing[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("status", true)
		.gt("stock", 0)
		.order("created_at", { ascending: false })
		.limit(8);

	if (error) {
		logQueryError("las últimas publicaciones", error.message);
		return [];
	}

	return (data ?? []) as ProductListing[];
}

export async function getAllPublishedProducts(): Promise<ProductListing[]> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("status", true)
		.order("created_at", { ascending: false });

	if (error) {
		logQueryError("las publicaciones", error.message);
		return [];
	}

	return (data ?? []) as ProductListing[];
}

export async function getProductById(productId: number): Promise<ProductListing | null> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("products")
		.select(`
			*,
			seller:profiles!fk_products_profiles (
				id,
				full_name
			)
		`)
		.eq("id", productId)
		.single();

	if (error) {
		logQueryError("el producto", error.message);
		return null;
	}

	return data as ProductListing | null;
}

export async function getProductStoreName(product: ProductListing): Promise<string | null> {
	if (!product.store_id) return null;

	const supabase = await createSupabaseServerClient();
	const { data } = await supabase
		.from("stores")
		.select("name")
		.eq("id", product.store_id)
		.maybeSingle();

	return typeof data?.name === "string" ? data.name : null;
}

export async function getProductBySlug(slug: string): Promise<ProductListing | null> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("products")
		.select(`
			*,
			seller:profiles!fk_products_profiles (
				id,
				full_name
			)
		`)
		.eq("slug", slug)
		.single();

	if (error) {
		logQueryError("el producto", error.message);
		return null;
	}

	return data as ProductListing | null;
}

