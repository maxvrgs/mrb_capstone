export type ProductListing = {
	id: number;
	name: string | null;
	slug: string | null;
	description: string | null;
	price: number | null;
	sale_type: string | null;
	discount_price: number | null;
	stock: number | null;
	images: string[] | null;
	seller_id: string;
	seller?: { id: string; full_name: string | null } | null;
	store_id: number | null;
	condition: string | null;
	status: boolean | null;
	shipping_available: boolean | null;
	is_featured: boolean | null;
	featured_until: string | null;
	offer_ends_at: string | null;
	created_at: string;
};

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

export const getProductImage = (product: Pick<ProductListing, "images">) =>
	product.images?.[0] ?? "https://picsum.photos/seed/vindex-product/600/600";