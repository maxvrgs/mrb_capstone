"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { getProductImage, type ProductListing } from "@/lib/product-utils";

type ProductPurchaseButtonProps = {
  product: Pick<
    ProductListing,
    "id" | "name" | "price" | "stock" | "images" | "seller_id" | "sale_type"
  >;
  currentPrice: number | null;
};

export default function ProductPurchaseButton({ product, currentPrice }: ProductPurchaseButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const [wasAdded, setWasAdded] = useState(false);
  const stock = Math.max(Math.floor(Number(product.stock) || 0), 0);
  const isFixedPrice = ["direct", "fixed_price"].includes(product.sale_type ?? "");
  const canAdd = hasHydrated && isFixedPrice && stock > 0 && Number.isFinite(currentPrice);

  return (
    <button
      type="button"
      disabled={!canAdd}
      onClick={() => {
        if (!canAdd || currentPrice === null) return;
        addItem({
          id: product.id,
          name: product.name ?? "Producto sin nombre",
          price: currentPrice,
          image: getProductImage(product),
          quantity: 1,
          stock,
          seller_id: product.seller_id,
        });
        setWasAdded(true);
      }}
      className="btn btn-primary flex-1 min-w-45 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingCart className="size-4" aria-hidden="true" />
      {!hasHydrated
        ? "Preparando carrito..."
        : canAdd
          ? wasAdded ? "Agregado al carrito" : "Agregar al carrito"
          : "No disponible para compra"}
    </button>
  );
}