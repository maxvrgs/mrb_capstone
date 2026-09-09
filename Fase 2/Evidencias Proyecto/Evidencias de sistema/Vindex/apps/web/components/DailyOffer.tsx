import { IconArrowRight, IconBolt, IconTag } from "@/components/icons";

export default function DailyOffer() {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 p-5 pb-4">
        <div>
          <p className="eyebrow text-accent-600">Oferta especial</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Oferta del día
          </h2>
        </div>
        <span className="badge badge-accent shrink-0">
          <IconTag className="h-3 w-3" />
          -33%
        </span>
      </div>

      {/* Imagen con cuenta regresiva */}
      <div className="relative mx-5 overflow-hidden rounded-xl bg-muted">
        <img
          src="https://picsum.photos/seed/vx-oferta/700/700"
          alt="Cafetera italiana en oferta"
          loading="lazy"
          className="aspect-4/3 w-full object-cover sm:aspect-square"
        />

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-black/60 px-3.5 py-2.5 text-white backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Termina en
            </p>
            <p className="font-mono text-base font-bold tracking-wider">
              03 : 21 : 44
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600">
            <IconBolt className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Detalle */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-foreground">
          Cafetera italiana 6 tazas
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">por Vintage Chile</p>

        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            $39.990
          </span>
          <span className="text-sm font-medium text-muted-foreground line-through">
            $59.990
          </span>
        </div>

        <a href="#" className="btn btn-primary mt-4 w-full py-3">
          Ver oferta
          <IconArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}