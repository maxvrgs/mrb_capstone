Aquí tienes exactamente el esquema que creamos en Supabase para que se lo compartas a tu IA de VS Code:

---

### Esquema de Tablas y Vistas (`public`)

1. **`stores` (Tiendas)**
* `id` (BIGINT, Primary Key)
* `owner_id` (UUID, Foreign Key $\rightarrow$ `profiles.id`) **$\leftarrow$ Identifica al dueño de la tienda**
* `name` (TEXT)
* `slug` (TEXT, Unique)
* `description` (TEXT)
* `logo_url` (TEXT)
* `banner_url` (TEXT)
* `created_at` (TIMESTAMPTZ)


2. **`store_categories` (Categorías de la Tienda)**
* `id` (BIGINT, Primary Key)
* `store_id` (BIGINT, Foreign Key $\rightarrow$ `stores.id`)
* `name` (TEXT)
* `created_at` (TIMESTAMPTZ)


3. **`products` (Productos - Columnas añadidas)**
* `store_id` (BIGINT, Foreign Key $\rightarrow$ `stores.id`, Nullable)
* `store_category_id` (BIGINT, Foreign Key $\rightarrow$ `store_categories.id`, Nullable)


4. **`reviews` (Reseñas y Calificaciones)**
* `id` (BIGINT, Primary Key)
* `product_id` (BIGINT, Foreign Key $\rightarrow$ `products.id`)
* `buyer_id` (UUID, Foreign Key $\rightarrow$ `profiles.id`) **$\leftarrow$ Identifica al usuario que califica**
* `seller_id` (UUID, Foreign Key $\rightarrow$ `profiles.id`) **$\leftarrow$ Identifica al vendedor calificado**
* `store_id` (BIGINT, Foreign Key $\rightarrow$ `stores.id`, Nullable)
* `rating` (INTEGER, de 1 a 5)
* `comment` (TEXT)
* `created_at` (TIMESTAMPTZ)


5. **`store_ratings` (Vista SQL de Estrellas por Tienda)**
* `store_id` (BIGINT)
* `average_rating` (NUMERIC, promedio redondeado a 1 decimal)
* `total_reviews` (BIGINT, conteo de reseñas)


6. **`seller_ratings` (Vista SQL de Reputación Global del Vendedor)**
* `seller_id` (UUID)
* `average_rating` (NUMERIC, promedio redondeado a 1 decimal)
* `total_reviews` (BIGINT, conteo total de reseñas recibidas)

---

### Integración web y permisos requeridos

- El frontend guarda logos y banners en el bucket público `product-images`, dentro de rutas `{auth.uid()}/stores/`. Las imágenes admitidas tienen un máximo de 5 MB.
- Las políticas de Storage deben permitir lectura pública y escritura solo a usuarios autenticados en su propia carpeta.
- Las páginas públicas requieren lectura de tiendas, categorías, reseñas y vistas de calificación; los productos visibles deben limitarse a `status = true`.
- Las políticas RLS de `stores` y `store_categories` deben limitar cambios al propietario de la tienda (`owner_id = auth.uid()` para tiendas y una comprobación equivalente a través de `store_id` para categorías).
- La inserción RLS en `reviews` debe verificar que `buyer_id = auth.uid()`, que el usuario sea `products.winner_id`, que la subasta haya terminado y que no se califique a sí mismo. La interfaz no reemplaza esta autorización en la base de datos.
- Se recomienda una restricción única sobre `(product_id, buyer_id)` para evitar reseñas duplicadas por carreras entre sesiones.

---

Copia esta lista y pásasela en el chat de VS Code para que proceda con la implementación frontend exacta.