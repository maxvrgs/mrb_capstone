import Link from "next/link";
import { IconBolt } from "@/components/icons";

export default function SecondaryNavbar() {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="container-site flex items-center gap-1 overflow-x-auto no-scrollbar">
        <Link
          href="/"
          className="nav-tab my-1.5 rounded-full bg-brand-50 text-brand-700 hover:text-brand-700"
        >
          Inicio
        </Link>

        <Link href="/tiendas" className="nav-tab">
          Tienda
        </Link>

        <Link href="/subastas" className="nav-tab">
          Subastas
        </Link>

        <Link href="/categorias" className="nav-tab">
          Categorías
        </Link>

        <Link href="/ofertas" className="nav-tab text-accent-600 hover:text-accent-700">
          <IconBolt className="h-3.5 w-3.5" />
          Ofertas
        </Link>
      </div>
    </nav>
  );
}