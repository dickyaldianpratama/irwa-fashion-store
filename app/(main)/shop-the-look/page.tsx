import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingBag, ArrowRight, Sparkles, Layers } from "lucide-react";

export const metadata = {
  title: "Shop The Look - Inspirasi Gaya Outfit Lengkap | IRWA Fashion Store",
  description: "Beli 1 set outfit lengkap pilihan fashion stylist kami. Lebih praktis, serasi, dan hemat.",
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

  // Helper untuk hitung jumlah item dari deskripsi
  const parseItemCount = (desc: string | null) => {
    if (!desc) return 0;
    const match = desc.match(/\[Items: (.*?)\]/);
    if (match && match[1]) {
      return match[1].split(" | ").length;
    }
    return 0;
  };

  const parseCleanDesc = (desc: string | null) => {
    if (!desc) return "";
    return desc.replace(/\[Items: .*?\]/, "").trim();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center text-xs text-gray-500 gap-1.5">
            <Link href="/" className="hover:text-primary transition-colors font-medium">
              Beranda
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium">Shop The Look</span>
          </nav>
        </div>
      </div>

      <div className="container-app max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Clean Header / Hero Banner */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <Sparkles size={13} /> Inspirasi Gaya Lengkap
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Shop The Look
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Beli 1 set outfit lengkap pilihan stylist busana terbaik kami. Tampil percaya diri, serasi, dan lebih hemat tanpa perlu bingung mencocokkan pakaian.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <span className="block text-xl font-black text-gray-900 font-mono">{looks.length}</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Koleksi Set</span>
            </div>
          </div>
        </div>

        {/* Listing Grid */}
        {looks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 max-w-md mx-auto shadow-2xs">
            <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-bold text-gray-900">
              Belum Ada Koleksi Look Set
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Koleksi outfit pilihan stylist akan segera hadir di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {looks.map((look) => {
              const itemCount = parseItemCount(look.deskripsi);
              const cleanDesc = parseCleanDesc(look.deskripsi);

              return (
                <div
                  key={look.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Clean Badge */}
                  <Link href={`/shop-the-look/${look.id}`} className="block relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    {look.image ? (
                      <Image
                        src={look.image}
                        alt={look.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
                        <ShoppingBag size={32} className="opacity-40" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <div className="bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-xs flex items-center gap-1">
                        <Layers size={11} className="text-primary" />
                        {itemCount > 0 ? `${itemCount} Items Set` : "1 Set Lengkap"}
                      </div>
                    </div>
                  </Link>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <Link href={`/shop-the-look/${look.id}`}>
                        <h2 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                          {look.title}
                        </h2>
                      </Link>
                      {cleanDesc && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {cleanDesc}
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Price & CTA */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Harga Paket Set
                        </span>
                        <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight font-mono">
                          {formatRupiah(look.totalHarga)}
                        </span>
                      </div>
                      <Link
                        href={`/shop-the-look/${look.id}`}
                        className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20 active:scale-95 shrink-0"
                      >
                        Beli Set <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
