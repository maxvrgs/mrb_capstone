import ProductCard from "@/components/ProductCard";
import { IconChevronDown, IconSliders } from "@/components/icons";

interface CatalogProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  seller?: string;
  previousPrice?: string;
  discount?: string;
}

const products: CatalogProduct[] = [
  { id: 1, name: "Teclado mecánico RGB", price: "$45.990", seller: "Retro Store", image: "https://picsum.photos/seed/vx-todo-1/600/600" },
  { id: 2, name: "Zapatillas urbanas", price: "$62.990", seller: "Vintage Chile", discount: "-15%", image: "https://picsum.photos/seed/vx-todo-2/600/600" },
  { id: 3, name: "Reloj clásico de cuarzo", price: "$58.990", seller: "Coleccionistas", image: "https://picsum.photos/seed/vx-todo-3/600/600" },
  { id: 4, name: "Mochila impermeable 25L", price: "$32.990", seller: "Arte & Diseño", image: "https://picsum.photos/seed/vx-todo-4/600/600" },
  { id: 5, name: "Lámpara de escritorio LED", price: "$27.990", seller: "Retro Store", discount: "-10%", image: "https://picsum.photos/seed/vx-todo-5/600/600" },
  { id: 6, name: "Cafetera italiana 6 tazas", price: "$39.990", seller: "Vintage Chile", previousPrice: "$59.990", image: "https://picsum.photos/seed/vx-todo-6/600/600" },
  { id: 7, name: "Set de pinceles profesionales", price: "$21.990", seller: "Arte & Diseño", image: "https://picsum.photos/seed/vx-todo-7/600/600" },
  { id: 8, name: "Parlante bluetooth portátil", price: "$49.990", seller: "Coleccionistas", image: "https://picsum.photos/seed/vx-todo-8/600/600" },
];

export default function AllProducts() {
  return (
    <section className="py-12">
      <div className="container-site">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <p className="eyebrow">Explora</p>
            <h2 className="section-title mt-1">Todas las publicaciones</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length} productos disponibles para ti
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline h-10">
              <IconSliders className="h-4 w-4" />
              Filtrar
            </button>
            <button type="button" className="btn btn-outline hidden h-10 px-4 sm:inline-flex">
              Relevancia
              <IconChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              previousPrice={product.previousPrice}
              discount={product.discount}
              seller={product.seller}
            />
          ))}
        </div>
      </div>
    </section>
  );
}