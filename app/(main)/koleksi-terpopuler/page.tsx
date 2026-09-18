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
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-primary/5 py-16 sm:py-24 relative overflow-hidden border-b border-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-primary/5 blur-3xl rounded-full transform rotate-12"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[100%] bg-blue-400/5 blur-3xl rounded-full transform -rotate-12"></div>
        </div>

        <div className="container-app relative z-10 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-white text-primary text-sm font-bold rounded-full uppercase tracking-widest shadow-sm mb-6 border border-primary/10">
            Koleksi Eksklusif
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Tren <span className="text-primary">Terpopuler</span> Saat Ini
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Jelajahi berbagai pilihan gaya dan koleksi pakaian pria terbaik kami yang sedang banyak diminati bulan ini.
          </p>
        </div>
      </div>

      <div className="container-app pt-8 relative z-20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-primary/30">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        {koleksiTerpopuler.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-lg font-medium text-gray-900">Belum ada koleksi terpopuler</p>
            <p className="text-sm mt-1">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
              const isDiscounted = !!item.hargaAsli && !!item.hargaDiskon && item.hargaAsli > item.hargaDiskon;

              return (
                <Link key={item.id} href={finalLink} className="group flex flex-col rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    {isDiscounted && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-danger text-white px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                          Promo
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Harga Pintar */}
                    {(item.hargaAsli || item.hargaDiskon) && (
                      <div className="mt-auto pt-3 flex flex-col">
                        {isDiscounted ? (
                          <>
                            <span className="text-gray-400 text-xs line-through">
                              Rp {(item.hargaAsli || 0).toLocaleString('id-ID')}
                            </span>
                            <span className="text-danger font-bold text-base">
                              Rp {(item.hargaDiskon || 0).toLocaleString('id-ID')}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 font-bold text-base">
                            Rp {(item.hargaAsli || item.hargaDiskon || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    )}
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
