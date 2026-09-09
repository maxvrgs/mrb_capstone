"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCart,
  IconHeart,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconTruck,
  IconUser,
} from "@/components/icons";

export default function Navbar() {
  const [search, setSearch] = useState("");

  const searchField = () => (
    <div className="relative w-full">
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar productos, tiendas o subastas…"
        aria-label="Buscar productos, tiendas o subastas"
        className="search-input"
      />
      <button
        type="button"
        className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 items-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Buscar
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Barra de confianza (solo escritorio) */}
      <div className="hidden bg-foreground text-white lg:block">
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-1.5 font-medium text-white/80">
            <IconShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            Compra protegida Vindex · Validación física mediante OTP
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-white/80">
              <IconTruck className="h-3.5 w-3.5 text-brand-400" />
              Envíos a todo Chile
            </span>
            <a href="#" className="font-medium text-white/80 transition hover:text-white">
              Centro de ayuda
            </a>
          </div>
        </div>
      </div>

      {/* Cabecera principal */}
      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <div className="container-site">
          <div className="flex h-16 items-center gap-3 sm:h-20 sm:gap-5">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Vindex, ir al inicio">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base font-extrabold text-white shadow-sm">
                V
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-foreground">
                  Vindex
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-600">
                  Marketplace
                </span>
              </span>
            </Link>

            {/* Buscador (escritorio) */}
            <div className="hidden flex-1 md:block">{searchField()}</div>

            {/* Acciones */}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-brand-50 hover:text-brand-700 lg:flex"
              >
                <IconUser className="h-5 w-5" />
                Ingresar
              </Link>

              <button type="button" className="icon-btn h-10 w-10" aria-label="Mis favoritos">
                <IconHeart className="h-5 w-5" />
                <span className="count-badge">3</span>
              </button>

              <button type="button" className="icon-btn h-10 w-10" aria-label="Mi carrito">
                <IconCart className="h-5 w-5" />
                <span className="count-badge">2</span>
              </button>

              <Link href="/" className="btn btn-primary hidden h-10 px-4 sm:inline-flex">
                <IconPlus className="h-4 w-4" />
                Vender
              </Link>
            </div>
          </div>

          {/* Buscador (móvil) */}
          <div className="pb-3 md:hidden">{searchField()}</div>
        </div>
      </div>
    </header>
  );
}