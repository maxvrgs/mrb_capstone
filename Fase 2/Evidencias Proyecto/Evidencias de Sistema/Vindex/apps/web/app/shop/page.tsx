import FeaturedProducts from "@/components/FeaturedProducts";
import DailyOffer from "@/components/DailyOffer";
import LatestProducts from "@/components/LatestProducts";
import PopularAuctions from "@/components/PopularAuctions";
import AllProducts from "@/components/AllProducts";
import PopularStores from "@/components/PopularStores";

export default function Shop(){
    return(
        <main className="min-h-screen bg-background">
            {/* Productos destacados */}
            <FeaturedProducts />
            
        </main>
    )
}