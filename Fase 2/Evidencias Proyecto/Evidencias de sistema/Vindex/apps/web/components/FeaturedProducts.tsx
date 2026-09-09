import ProductCard from "@/components/ProductCard";
import { IconChevronRight } from "@/components/icons";

const products = [
  {
    id: 1,
    name: "Cámara analógica compacta",
    price: "$89.990",
    previousPrice: "$129.990",
    discount: "-31%",
    seller: "Retro Store",
    image: "https://picsum.photos/seed/vx-camara/800/800",
  },
  {
    id: 2,
    name: "Polera edición limitada",
    price: "$34.990",
    discount: "-20%",
    seller: "Arte & Diseño",
    image: "https://picsum.photos/seed/vx-polera/800/800",
  },
  {
    id: 3,
    name: "Figura coleccionable 30 cm",
    price: "$59.990",
    seller: "Coleccionistas",
    image: "https://picsum.photos/seed/vx-figura/800/800",
  },
  {
    id: 4,
    name: "Consola retro reparada",
    price: "$129.990",
    previousPrice: "$159.990",
    discount: "-19%",
    seller: "Retro Store",
    image: "https://picsum.photos/seed/vx-consola/800/800",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-brand-700 via-brand-600 to-brand-500">
      {/* Decoración difuminada */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />

      <div className="container-site relative py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <p className="eyebrow text-brand-200">Descubre</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Productos destacados
            </h2>
            <p className="mt-2 max-w-xl text-sm text-brand-100">
              Lo mejor de la semana, seleccionado por nuestra comunidad de
              compradores y vendedores.
            </p>
          </div>

          <a href="#" className="link-more text-white hover:text-brand-100">
            Ver todos
            <IconChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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