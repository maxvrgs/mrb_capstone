import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type ProductListing = {
	id: number;
	name: string | null;
	slug: string | null;
	description: string | null;
	price: number | null;
	discount_price: number | null;
	stock: number | null;
	images: string[] | null;
	seller_id: string;
	condition: string | null;
	status: boolean | null;
	shipping_available: boolean | null;
	is_featured: boolean | null;
	featured_until: string | null;
	offer_ends_at: string | null;
	created_at: string;
};

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
		.select("*")
		.eq("id", productId)
		.single();

	if (error) {
		logQueryError("el producto", error.message);
		return null;
	}

	return data as ProductListing | null;
}

export const formatProductPrice = (price: number | null) =>
	new Intl.NumberFormat("es-CL", {
		style: "currency",
		currency: "CLP",
		maximumFractionDigits: 0,
	}).format(price ?? 0);

export const getActiveDiscountPrice = (product: ProductListing) =>
	product.discount_price !== null &&
	product.offer_ends_at !== null &&
	new Date(product.offer_ends_at).getTime() > Date.now()
		? product.discount_price
		: null;

export const getDiscountLabel = (product: ProductListing) => {
	const activeDiscountPrice = getActiveDiscountPrice(product);
	if (!product.price || activeDiscountPrice === null) return undefined;
	const percentage = Math.round(((product.price - activeDiscountPrice) / product.price) * 100);
	return `-${percentage}%`;
};

export const getProductImage = (product: ProductListing) =>
	product.images?.[0] ?? "https://picsum.photos/seed/vindex-product/600/600";