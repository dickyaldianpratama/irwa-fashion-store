import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Koleksi Terpopuler | Irwa Fashion",
  description: "Jelajahi semua koleksi pakaian pria terpopuler dan tren terbaru di Irwa Fashion.",
};

export default async function KoleksiTerpopulerPage() {
  const koleksiTerpopuler = await prisma.koleksiTerpopuler.findMany({
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container-app">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Semua Koleksi Terpopuler</h1>
          <p className="text-gray-500 mt-2">Jelajahi berbagai pilihan koleksi terbaik kami khusus untuk Anda.</p>
        </div>

        {koleksiTerpopuler.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            Belum ada koleksi terpopuler.
          </div>
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
    </div>
  );
}
