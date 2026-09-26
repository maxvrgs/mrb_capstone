ALTER TABLE public.products
	ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
	ADD COLUMN IF NOT EXISTS featured_until timestamp with time zone,
	ADD COLUMN IF NOT EXISTS discount_price numeric,
	ADD COLUMN IF NOT EXISTS offer_ends_at timestamp with time zone;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'products_discount_price_lt_price_check'
			AND conrelid = 'public.products'::regclass
	) THEN
		ALTER TABLE public.products
			ADD CONSTRAINT products_discount_price_lt_price_check
			CHECK (discount_price IS NULL OR (price IS NOT NULL AND discount_price < price));
	END IF;
END;
$$;