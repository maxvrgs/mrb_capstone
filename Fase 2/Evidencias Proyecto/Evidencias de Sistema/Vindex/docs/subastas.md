# Subastas en Vindex

Esta guía describe el funcionamiento de las subastas en la aplicación web: publicación, catálogo, sala de pujas en vivo, persistencia en Supabase y archivos principales.

## Resumen del flujo

1. El vendedor publica un producto como subasta desde `/vender`.
2. La aplicación crea una fila en `public.products` con `sale_type = 'auction'` y los valores propios de la subasta.
3. El catálogo `/subastas` y el bloque de subastas destacadas del Home consultan subastas activas mediante peticiones normales. No crean conexiones Realtime.
4. La sala `/subastas/[id]` carga el producto, el perfil del vendedor y las pujas recientes desde el servidor.
5. En la sala, el cliente abre un canal Realtime filtrado para ese producto. Los INSERT de `bids` actualizan el historial y el monto; los UPDATE de `products` sincronizan la puja actual y el vencimiento.
6. Para registrar una oferta, el cliente llama a la función RPC transaccional `place_bid`. No se insertan filas en `bids` directamente desde el navegador.

## Modelo de datos

### `public.products`

Las subastas se distinguen con `sale_type = 'auction'`. Los campos relevantes son:

| Campo | Uso |
| --- | --- |
| `id` (`BIGINT`) | Identificador de producto/subasta. En la aplicación se maneja como `number`. |
| `seller_id` (`UUID`) | Perfil propietario, relacionado con `public.profiles(id)`. |
| `name`, `description`, `condition`, `images` | Información mostrada en el detalle y catálogo. `images` contiene URLs públicas. |
| `stock` | Cantidad publicada. El formulario requiere al menos una unidad para una subasta. |
| `sale_type` | Debe ser `auction` para aparecer como subasta. |
| `is_auction` | Indicador compatible con el esquema existente. Se establece en `true` al publicar una subasta. |
| `starting_price` (`NUMERIC`) | Precio inicial configurado por el vendedor. |
| `current_bid` (`NUMERIC`) | Oferta vigente; parte en `NULL` y se establece al recibirse una puja. |
| `bid_increment` (`NUMERIC`) | Incremento mínimo positivo entre ofertas. |
| `auction_ends_at` (`TIMESTAMPTZ`) | Fecha de cierre, calculada según la duración elegida. |
| `winner_id` (`UUID`) | Perfil ganador, inicialmente `NULL`. |
| `status` (`BOOLEAN`) | `true` significa publicación activa. Retirar una publicación usa baja lógica, `status = false`. |

Para una publicación de subasta, `price`, `discount_price` y `offer_ends_at` quedan nulos; el valor inicial se almacena en `starting_price`. Los campos propios de la subasta quedan nulos en una venta directa.

### `public.bids`

Cada oferta contiene:

| Campo | Uso |
| --- | --- |
| `id` | Identificador de la puja. El formateador de cliente lo normaliza como `string` para usarlo como clave estable. |
| `product_id` (`BIGINT`) | Subasta a la que pertenece. |
| `bidder_id` (`UUID`) | Perfil del postor. La FK `fk_bids_profiles` apunta a `public.profiles(id)`. |
| `amount` (`NUMERIC`) | Monto ofrecido. |
| `created_at` | Fecha y hora de la oferta. |

La consulta de pujas carga el nombre mediante la relación explícita `profiles:profiles!fk_bids_profiles(full_name)`. Si no hay nombre de perfil disponible, la sala muestra `Postor Anónimo`; para identificar la propia oferta, muestra `Tu puja`.

## Publicar una subasta

En [la página de venta](../apps/web/app/vender/page.tsx), el vendedor activa **Publicar como subasta** y completa:

- Precio inicial (`starting_price`).
- Incremento mínimo (`bid_increment`), que debe ser mayor que cero.
- Duración (24 o 48 horas, 7 o 14 días); de ella se calcula `auction_ends_at`.
- Stock, condición, descripción, imágenes y disponibilidad de envío.

Al guardar se crea la fila en `products` con `sale_type = 'auction'`, `is_auction = true`, `current_bid = NULL` y `winner_id = NULL`. El canal no se crea durante la publicación ni en el catálogo.

## Catálogo

La ruta [app/subastas/page.tsx](../apps/web/app/subastas/page.tsx) usa `getActiveAuctions()` desde [queries.ts](../apps/web/lib/supabase/queries.ts). La consulta obtiene productos activos (`status = true`) de tipo subasta cuya fecha `auction_ends_at` sea posterior al momento actual, y los ordena por vencimiento.

Las tarjetas se implementan en [AuctionCard.tsx](../apps/web/components/auctions/AuctionCard.tsx). Muestran imagen, nombre, oferta actual —`current_bid` o `starting_price` si aún no hay ofertas— y tiempo restante. [AuctionCountdown.tsx](../apps/web/components/auctions/AuctionCountdown.tsx) actualiza la cuenta regresiva localmente cada segundo y señala como «Por finalizar» los últimos diez minutos.

El bloque «Subastas populares» del Home usa [PopularAuctions.tsx](../apps/web/components/PopularAuctions.tsx) y la misma consulta normal. Ninguna de estas listas crea canales WebSocket.

## Sala de subasta

La ruta [app/subastas/[id]/page.tsx](../apps/web/app/subastas/[id]/page.tsx):

1. Valida que el ID de la ruta sea un entero positivo seguro.
2. Carga el producto con `getAuctionById()`, incluyendo el perfil del vendedor mediante `fk_products_profiles`.
3. Carga hasta 20 pujas iniciales mediante `getAuctionBids()`, en orden `created_at DESC`, con el JOIN a `profiles` por `fk_bids_profiles`.
4. Carga el nombre del ganador, cuando ya existe.
5. Entrega esos datos a [AuctionRoom.tsx](../apps/web/components/auctions/AuctionRoom.tsx).

La sala muestra la galería, descripción, condición, vendedor, oferta vigente, mínimo siguiente, tiempo restante y pujas recientes. El siguiente monto se calcula como `current_bid + bid_increment`; si aún no hay ofertas, se usa `starting_price`.

Al llegar el contador a cero, se deshabilita el formulario y se presenta el ganador si `winner_id` está definido. El ganador se consulta en `public.profiles`.

### Envío de una puja

La sala invoca exclusivamente esta RPC:

```ts
const { error } = await supabase.rpc("place_bid", {
  p_product_id: product.id,
  p_bid_amount: amount,
});
```

El backend valida y registra la puja de forma transaccional. La interfaz valida el monto mínimo, presenta el estado de carga y muestra cualquier error devuelto por la RPC. El mensaje de éxito indica que espera la confirmación de la sala en vivo; el feed se actualiza con el evento Realtime.

## Supabase Realtime

El hook [useAuctionRealtime.ts](../apps/web/hooks/useAuctionRealtime.ts) pertenece únicamente a la sala. Crea un canal por producto (`auction-room-${productId}`) y registra dos suscripciones:

- `public.bids`, evento `INSERT`, filtrado por `product_id=eq.<productId>`.
- `public.products`, evento `UPDATE`, filtrado por `id=eq.<productId>`.

Al insertar una puja, el hook:

1. Registra el payload crudo para diagnóstico.
2. Normaliza el objeto y valida sus campos con `formatAuctionBid()`.
3. Consulta el nombre del postor en `public.profiles`; si no está disponible, conserva un fallback.
4. Inserta la puja al inicio del estado, evitando duplicados por ID.
5. Actualiza localmente `current_bid`.

Si `payload.new` llega vacío o incompleto, consulta la última puja de la subasta ordenada por `created_at DESC` y aplica la misma normalización y deduplicación. El UPDATE de `products` sincroniza `current_bid`, `auction_ends_at` y `winner_id`, incluido un eventual ajuste anti-sniping.

El hook registra el estado de suscripción (`SUBSCRIBED`, `CHANNEL_ERROR`, `TIMED_OUT`) y los errores en consola. Al desmontar la sala, retira el canal mediante `supabase.removeChannel(channel)`.

### Requisitos de Supabase

- `public.products` y `public.bids` deben estar en la publicación `supabase_realtime`.
- Debe existir la RPC transaccional `public.place_bid` con parámetros `p_product_id` y `p_bid_amount`.
- Debe existir la clave foránea `fk_bids_profiles` de `bids.bidder_id` a `profiles.id`, además de la relación existente `fk_products_profiles` para el vendedor.
- Las políticas RLS deben permitir al usuario consultar subastas y pujas que corresponden a la experiencia pública, leer los perfiles necesarios y ejecutar la RPC según las reglas del negocio.
- En una tabla protegida por RLS, Realtime solo entrega al cliente eventos para los que la sesión cumple las políticas de lectura aplicables.

## Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| [apps/web/app/vender/page.tsx](../apps/web/app/vender/page.tsx) | Formulario para crear ventas directas o subastas y almacenar las columnas correctas. |
| [apps/web/app/subastas/page.tsx](../apps/web/app/subastas/page.tsx) | Catálogo sin WebSockets. |
| [apps/web/app/subastas/[id]/page.tsx](../apps/web/app/subastas/[id]/page.tsx) | Carga inicial de producto, vendedor, pujas y ganador. |
| [apps/web/components/auctions/AuctionRoom.tsx](../apps/web/components/auctions/AuctionRoom.tsx) | Interfaz de sala, RPC, contador y feed. |
| [apps/web/components/auctions/AuctionCard.tsx](../apps/web/components/auctions/AuctionCard.tsx) | Tarjeta de catálogo. |
| [apps/web/components/auctions/AuctionCountdown.tsx](../apps/web/components/auctions/AuctionCountdown.tsx) | Cuenta regresiva local y presentación de estado. |
| [apps/web/hooks/useAuctionRealtime.ts](../apps/web/hooks/useAuctionRealtime.ts) | Canales filtrados, estado local, respaldo y limpieza Realtime. |
| [apps/web/lib/supabase/queries.ts](../apps/web/lib/supabase/queries.ts) | Consultas iniciales de catálogo, producto, vendedor, pujas y ganador. |
| [apps/web/lib/product-utils.ts](../apps/web/lib/product-utils.ts) | Tipos compartidos locales y normalización de pujas y montos. |

## Prueba manual

1. Verificar que las columnas de subasta, la RPC, las claves foráneas, la publicación Realtime y las políticas RLS estén configuradas en Supabase.
2. Iniciar sesión con un usuario vendedor y publicar una subasta con precio inicial, incremento positivo y duración.
3. Abrir `/subastas`, confirmar que la publicación aparece con monto inicial y contador, y abrir su sala.
4. En una segunda sesión o navegador, abrir la misma sala y enviar una puja válida desde la primera sesión.
5. Confirmar que ambas salas muestran la nueva oferta, el nombre (o fallback) del postor y el nuevo monto actual sin recargar.
6. Revisar la consola del navegador para `[Realtime status]: SUBSCRIBED` y `[DEBUG Raw Realtime Payload]`. Si el payload está vacío, confirmar que la consulta de respaldo recupera la puja.
7. Comprobar que la extensión anti-sniping, si está implementada en la RPC, se refleja en `auction_ends_at` y en el contador de la sala.
