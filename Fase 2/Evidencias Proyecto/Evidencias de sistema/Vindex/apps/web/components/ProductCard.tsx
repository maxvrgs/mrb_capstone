import { IconHeart } from "@/components/icons";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  /** Precio anterior (se muestra tachado) */
  previousPrice?: string;
  /** Etiqueta de descuento, p. ej. "-31%" */
  discount?: string;
  /** Vendedor / tienda */
  seller?: string;
}

/**
 * Tarjeta de producto reutilizable del sistema de diseño.
 * Ver reglas en apps/web/DESIGN_SYSTEM.md → Componentes → card.
 */
export default function ProductCard({
  name,
  price,
  image,
  previousPrice,
  discount,
  seller,
}: ProductCardProps) {
  return (
    <article className="card group flex h-full flex-col transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {discount && (
          <span className="badge badge-accent absolute left-3 top-3">{discount}</span>
        )}

        <button
          type="button"
          aria-label={`Agregar ${name} a favoritos`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground backdrop-blur transition hover:border-brand-300 hover:text-brand-700"
        >
          <IconHeart className="h-4 w-4" />
        </button>

        {/* CTA al pasar el cursor */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="btn btn-primary h-9 w-full rounded-full !bg-foreground hover:!bg-brand-700">
            Ver producto
          </span>
        </div>
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-foreground transition group-hover:text-brand-700">
          {name}
        </h3>

        {seller && (
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            por {seller}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            {price}
          </span>
          {previousPrice && (
            <span className="text-xs font-medium text-muted-foreground line-through">
              {previousPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
