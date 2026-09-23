import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Inspirasi Gaya - Shop The Look | IRWA Store",
  description: "Beli 1 set outfit lengkap pilihan fashion stylist kami. Lebih praktis, harga lebih hemat.",
};

export default async function ShopTheLookListingPage() {
  const looks = await prisma.shopTheLook.findMany({
    include: {
      items: {
        include: {
          produk: {
            include: {
              images: { where: { isUtama: true }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-20 pt-6">
      <div className="container-app max-w-6xl mx-auto px-4">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 rounded-3xl mb-10 relative overflow-hidden shadow-xl">
          <div className="max-w-xl relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/30">
              <Sparkles size={12} className="text-amber-400" /> Fashion Stylist Recommendations
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Inspirasi Gaya - Shop The Look
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Beli 1 set outfit lengkap pilihan peragaan busana terbaik kami. Praktis, tampil memukau, dan lebih hemat.
            </p>
          </div>
        </div>

        {/* Listing Grid */}
        {looks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
            <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Belum Ada Look Set
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Nantikan peragaan outfit set terbaru kami segera.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {looks.map((look) => (
              <div
                key={look.id}
                className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {look.image ? (
                    <Image
                      src={look.image}
                      alt={look.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    1 Set Lengkap
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="font-bold text-lg leading-tight mb-1">{look.title}</h2>
                    <p className="text-xs text-gray-300 line-clamp-2">{look.deskripsi}</p>
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Harga Paket Set
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(look.totalHarga)}
                    </span>
                  </div>
                  <Link
                    href={`/shop-the-look/${look.id}`}
                    className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                  >
                    Beli Set <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
