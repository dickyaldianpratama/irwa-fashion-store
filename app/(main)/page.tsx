import HeroBanner from "@/components/beranda/HeroBanner";
import CategoryGrid from "@/components/beranda/CategoryGrid";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";
import ShopTheLook from "@/components/beranda/ShopTheLook";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  // Fetch semua data secara paralel
  const [koleksiTerpopuler, kategoriPilihan, looks] = await Promise.all([
    // Koleksi Terpopuler Standalone
    prisma.koleksiTerpopuler.findMany({
      orderBy: { urutan: "asc" },
      take: 10,
    }),
    // Kategori Pilihan Standalone
    prisma.kategoriPilihan.findMany({ orderBy: { nama: "asc" } }),
    // Shop The Look dari database
    prisma.shopTheLook.findMany({
      include: {
        items: {
          include: {
            produk: {
              include: { images: { where: { isUtama: true }, take: 1 } }
            }
          }
        }
      },
      orderBy: { id: "desc" },
      take: 6,
    }),
  ]);

  return (
    <>
      <HeroBanner />
      <CategoryGrid kategori={kategoriPilihan} />

      <section id="belanja" className="py-10 sm:py-14 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="section-title !mb-0 text-xl sm:text-2xl">Koleksi Terpopuler</h2>
            <Link href="/produk" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          {koleksiTerpopuler.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Belum ada koleksi terpopuler.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {koleksiTerpopuler.map((item) => {
                // Auto-generate link berdasarkan kata kunci pada judul jika db link kosong
                let autoLink = "/produk";
                const titleLower = item.title.toLowerCase();
                
                if (titleLower.includes("kemeja")) autoLink = "/produk?kategori=kemeja";
                else if (titleLower.includes("celana")) autoLink = "/produk?kategori=celana";
                else if (titleLower.includes("kaos") || titleLower.includes("t-shirt")) autoLink = "/produk?kategori=kaos";
                else if (titleLower.includes("jaket") || titleLower.includes("outer") || titleLower.includes("sweater")) autoLink = "/produk?kategori=jaket";
                else if (titleLower.includes("aksesoris") || titleLower.includes("topi")) autoLink = "/produk?kategori=aksesoris";
                
                // Gunakan db link jika ada (legacy), jika tidak gunakan autoLink
                const finalLink = (item.link && item.link !== "#") ? item.link : autoLink;

                return (
                  <Link key={item.id} href={finalLink} className="group block rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ShopTheLook looks={looks} />
    </>
  );
}