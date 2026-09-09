import ProductCard from "@/components/ProductCard";
import { IconChevronRight } from "@/components/icons";

const products = [
  {
    id: 1,
    name: "Auriculares over-ear",
    price: "$24.990",
    seller: "Arte & Diseño",
    image: "https://picsum.photos/seed/vx-audio/400/400",
  },
  {
    id: 2,
    name: "Botella térmica 750 ml",
    price: "$19.990",
    seller: "Vintage Chile",
    image: "https://picsum.photos/seed/vx-termica/400/400",
  },
  {
    id: 3,
    name: "Libro ilustrado de colección",
    price: "$15.990",
    seller: "Coleccionistas",
    image: "https://picsum.photos/seed/vx-libro/400/400",
  },
  {
    id: 4,
    name: "Set de tazas artesanales",
    price: "$22.990",
    discount: "-10%",
    seller: "Arte & Diseño",
    image: "https://picsum.photos/seed/vx-tazas/400/400",
  },
];

export default function LatestProducts() {
  return (
    <section className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Recién publicado</p>
          <h2 className="section-title mt-1 text-xl sm:text-2xl">
            Últimas publicaciones
          </h2>
        </div>

        <a href="#" className="link-more shrink-0">
          Ver todos
          <IconChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            discount={product.discount}
            seller={product.seller}
          />
        ))}
      </div>
    </section>
  );
}