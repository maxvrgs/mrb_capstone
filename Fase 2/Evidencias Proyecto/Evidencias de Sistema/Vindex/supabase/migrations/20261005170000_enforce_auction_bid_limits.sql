CREATE OR REPLACE FUNCTION public.enforce_auction_bid_limits()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_starting_price numeric;
  v_bid_increment numeric;
  v_sale_type text;
  v_status text;
  v_previous_bid numeric;
  v_reference_amount numeric;
  v_minimum_bid numeric;
  v_maximum_bid numeric;
BEGIN
  SELECT
    starting_price,
    bid_increment,
    sale_type,
    status::text
  INTO
    v_starting_price,
    v_bid_increment,
    v_sale_type,
    v_status
  FROM public.products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La subasta asociada a esta puja no existe.';
  END IF;

  IF v_sale_type IS DISTINCT FROM 'auction' OR v_status IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La publicación no es una subasta activa.';
  END IF;

  IF NEW.amount IS NULL OR NEW.amount <> trunc(NEW.amount) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Las pujas deben ser montos enteros en pesos chilenos.';
  END IF;

  SELECT MAX(amount)
  INTO v_previous_bid
  FROM public.bids
  WHERE product_id = NEW.product_id;

  v_reference_amount := COALESCE(v_previous_bid, v_starting_price);
  IF v_starting_price IS NULL OR v_starting_price <= 0
    OR v_starting_price <> trunc(v_starting_price)
    OR v_reference_amount IS NULL OR v_reference_amount <= 0
    OR v_bid_increment IS NULL OR v_bid_increment <= 0
    OR v_bid_increment > floor(v_starting_price * 0.5) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'La subasta no tiene un precio o incremento válido para aceptar pujas.';
  END IF;

  v_minimum_bid := COALESCE(v_previous_bid + v_bid_increment, v_starting_price);
  v_maximum_bid := floor(v_reference_amount * 1.5);

  IF NEW.amount < v_minimum_bid THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = format('La puja mínima para esta subasta es %s CLP.', v_minimum_bid);
  END IF;

  IF NEW.amount > v_maximum_bid THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = format('La puja máxima para este turno es %s CLP.', v_maximum_bid);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_auction_bid_limits_before_insert ON public.bids;

CREATE TRIGGER enforce_auction_bid_limits_before_insert
BEFORE INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.enforce_auction_bid_limits();
