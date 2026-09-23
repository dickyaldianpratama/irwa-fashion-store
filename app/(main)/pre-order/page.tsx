import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, ShoppingBag } from "lucide-react";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";

export const metadata = {
  title: "Produk Pre-Order | Irwa Fashion",
  description: "Dapatkan koleksi pakaian edisi eksklusif sebelum resmi diluncurkan.",
};

export default async function PreOrderPage() {
  const preOrderProducts = await prisma.produk.findMany({
    where: { isPreOrder: true },
    include: {
      images: { where: { isUtama: true }, take: 1 },
      kategori: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const productsFormatted: ProductType[] = preOrderProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.nama,
    image: p.images[0]?.url || "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600",
    price: p.hargaDiskon || p.hargaAsli,
    originalPrice: p.hargaDiskon ? p.hargaAsli : undefined,
    rating: p.rating || 4.9,
    soldCount: p.terjual || 0,
    badges: ["PO"],
  }));

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Koleksi Pre-Order Eksklusif
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Pesan koleksi pakaian edisi khusus lebih awal dengan penawaran istimewa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {productsFormatted.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Belum Ada Produk Pre-Order Aktif
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
              Koleksi pre-order terbaru sedang dalam tahap produksi. Silakan lihat pilihan koleksi terpopuler kami.
            </p>
            <Link href="/koleksi-terpopuler" className="btn btn-primary text-xs px-5 py-2.5 rounded-xl">
              Lihat Koleksi Terpopuler
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {productsFormatted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
