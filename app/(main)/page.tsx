import HeroBanner from "@/components/beranda/HeroBanner";
import CategoryGrid from "@/components/beranda/CategoryGrid";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";
import ShopTheLook from "@/components/beranda/ShopTheLook";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  // Fetch real data from Prisma Database
  const dbProducts = await prisma.produk.findMany({
    include: {
      images: {
        where: { isUtama: true },
        take: 1
      }
    },
    take: 10,
    orderBy: { terjual: "desc" }
  });

  // Map to ProductType expected by ProductCard component
  const products: ProductType[] = dbProducts.map((p) => {
    const badges: ("NEW" | "SALE" | "BESTSELLER" | "PO")[] = [];
    if (p.hargaDiskon) badges.push("SALE");
    if (p.terjual > 500) badges.push("BESTSELLER");
    if (p.isPreOrder) badges.push("PO");
    if (!badges.length) badges.push("NEW"); // default if empty just to show something

    return {
      id: p.id,
      slug: p.slug,
      name: p.nama,
      image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=400",
      price: p.hargaDiskon || p.hargaAsli,
      originalPrice: p.hargaDiskon ? p.hargaAsli : undefined,
      rating: p.rating || 5.0,
      soldCount: p.terjual || 0,
      badges: badges,
    };
  });

  return (
    <>
      <HeroBanner />
      <CategoryGrid />

      <section id="belanja" className="py-10 sm:py-14 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="section-title !mb-0 text-xl sm:text-2xl">Koleksi Terpopuler</h2>
            <Link href="/produk" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          
          {products.length === 0 ? (
             <div className="py-12 text-center text-gray-500">Belum ada produk di database.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <ShopTheLook />
    </>
  );
}

