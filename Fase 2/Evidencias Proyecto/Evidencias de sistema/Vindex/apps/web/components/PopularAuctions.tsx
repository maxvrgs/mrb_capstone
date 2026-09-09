import { IconBolt, IconChevronRight, IconClock } from "@/components/icons";

const auctions = [
  {
    id: 1,
    name: "Figura coleccionable edición limitada",
    bid: "$52.000",
    bids: 14,
    time: "02:34:15",
    image: "https://picsum.photos/seed/vx-sub-1/600/500",
  },
  {
    id: 2,
    name: "Consola retro con controles",
    bid: "$78.500",
    bids: 21,
    time: "04:12:09",
    image: "https://picsum.photos/seed/vx-sub-2/600/500",
  },
  {
    id: 3,
    name: "Cámara antigua 35 mm",
    bid: "$96.000",
    bids: 9,
    time: "01:05:44",
    image: "https://picsum.photos/seed/vx-sub-3/600/500",
  },
  {
    id: 4,
    name: "Vinilo edición especial",
    bid: "$31.000",
    bids: 17,
    time: "05:47:30",
    image: "https://picsum.photos/seed/vx-sub-4/600/500",
  },
];

export default function PopularAuctions() {
  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="container-site">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <p className="eyebrow flex items-center gap-1.5 text-accent-600">
              <span className="h-2 w-2 rounded-full bg-accent-600 animate-pulse" />
              En vivo
            </p>
            <h2 className="section-title mt-1">Subastas populares</h2>
          </div>

          <a href="#" className="link-more">
            Ver todas
            <IconChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {auctions.map((auction) => (
            <article
              key={auction.id}
              className="card group transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={auction.image}
                  alt={auction.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <span className="badge badge-accent absolute left-3 top-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  En vivo
                </span>

                <span className="badge badge-overlay absolute bottom-3 left-3">
                  <IconClock className="h-3 w-3" />
                  {auction.time}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                    {auction.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">Oferta actual</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-extrabold tracking-tight text-foreground">
                    {auction.bid}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-700">
                    {auction.bids} pujas
                  </p>
                </div>
              </div>

              <div className="border-t border-border p-3">
                <a href="#" className="btn btn-outline h-9 w-full">
                  <IconBolt className="h-4 w-4" />
                  Pujar ahora
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}