import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Flame, Zap } from "lucide-react";
import KoleksiCard from "@/components/beranda/KoleksiCard";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";

export const metadata = {
  title: "Promo & Flash Sale | Irwa Fashion",
  description:
    "Nikmati promo diskon spesial, flash sale pakaian pria terbaik di Irwa Fashion.",
};

export default async function PromoPage() {
  const [promoKoleksi, promoProduk] = await Promise.all([
    // Koleksi yang memiliki promo diskon atau label promo
    prisma.koleksiTerpopuler.findMany({
      where: {
        OR: [
          { hargaDiskon: { not: null } },
          { labelPromo: { not: null } },
        ],
      },
      orderBy: { urutan: "asc" },
    }),
    // Produk umum yang memiliki diskon
    prisma.produk.findMany({
      where: {
        hargaDiskon: { not: null },
      },
      include: {
        images: { where: { isUtama: true }, take: 1 },
      },
      orderBy: { id: "desc" },
    }),
  ]);

  const formattedProducts: ProductType[] = promoProduk.map((p: any) => {
    const mainImg =
      p.images[0]?.url ||
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
    return {
      id: p.id,
      slug: p.slug,
      name: p.nama,
      image: mainImg,
      price: p.hargaDiskon || p.hargaAsli,
      originalPrice: p.hargaDiskon ? p.hargaAsli : undefined,
      rating: p.rating || 4.8,
      soldCount: p.terjual || 0,
      badges: ["SALE"],
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Promo Hero Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="container-app relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
            <Flame size={14} className="text-yellow-300" />
            Penawaran Terbatas
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight drop-shadow-sm">
            Flash Sale & Promo Spesial
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto">
            Dapatkan diskon harga spesial untuk berbagai pilihan koleksi busana
            pria terbaik kami hari ini.
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary bg-white border border-gray-200 px-3.5 py-2 rounded-lg shadow-2xs transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>

        {promoKoleksi.length === 0 && formattedProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
              <Zap size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Belum Ada Promo Aktif
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Nantikan penawaran promo spesial kami berikutnya.
            </p>
            <Link href="/" className="btn btn-primary text-xs px-4 py-2">
              Jelajahi Beranda
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {promoKoleksi.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={20} className="text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Koleksi Terpopuler Sedang Promo ({promoKoleksi.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {promoKoleksi.map((item) => (
                    <KoleksiCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {formattedProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Produk Diskon Lainnya ({formattedProducts.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {formattedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
