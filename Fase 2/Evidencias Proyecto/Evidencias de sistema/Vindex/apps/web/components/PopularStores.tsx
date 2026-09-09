import { IconChevronRight, IconStar, IconStore } from "@/components/icons";

const stores = [
  { name: "Retro Store", rating: 4.9, items: 328 },
  { name: "Arte & Diseño", rating: 4.8, items: 245 },
  { name: "Coleccionistas", rating: 4.7, items: 512 },
  { name: "Vintage Chile", rating: 4.9, items: 189 },
];

export default function PopularStores() {
  return (
    <section className="border-y border-border bg-brand-50/70 py-12">
      <div className="container-site">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <p className="eyebrow">Descubre vendedores</p>
            <h2 className="section-title mt-1">Tiendas populares</h2>
          </div>

          <a href="#" className="link-more">
            Ver todas
            <IconChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store) => (
            <article
              key={store.name}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm transition group-hover:scale-105">
                <IconStore className="h-6 w-6" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-foreground transition group-hover:text-brand-700">
                  {store.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <IconStar className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-semibold text-foreground">{store.rating}</span>
                  · {store.items} publicaciones
                </p>
              </div>

              <IconChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}