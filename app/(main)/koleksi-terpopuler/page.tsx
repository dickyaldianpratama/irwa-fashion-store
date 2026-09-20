import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Koleksi Terpopuler | Irwa Fashion",
  description:
    "Jelajahi semua koleksi pakaian pria terpopuler dan tren terbaru di Irwa Fashion.",
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
            Jelajahi berbagai pilihan gaya dan koleksi pakaian pria terbaik kami
            yang sedang banyak diminati bulan ini.
          </p>
        </div>
      </div>

      <div className="container-app pt-8 relative z-20">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-primary/30"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        {koleksiTerpopuler.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Belum ada koleksi terpopuler
            </p>
            <p className="text-sm mt-1">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {koleksiTerpopuler.map((item) => {
              // Auto-generate link berdasarkan kata kunci pada judul jika db link kosong
              let autoLink = "/produk";
              const titleLower = item.title.toLowerCase();

              if (titleLower.includes("kemeja"))
                autoLink = "/produk?kategori=kemeja";
              else if (titleLower.includes("celana"))
                autoLink = "/produk?kategori=celana";
              else if (
                titleLower.includes("kaos") ||
                titleLower.includes("t-shirt")
              )
                autoLink = "/produk?kategori=kaos";
              else if (
                titleLower.includes("jaket") ||
                titleLower.includes("outer") ||
                titleLower.includes("sweater")
              )
                autoLink = "/produk?kategori=jaket";
              else if (
                titleLower.includes("aksesoris") ||
                titleLower.includes("topi")
              )
                autoLink = "/produk?kategori=aksesoris";

              const finalLink =
                item.link && item.link !== "#" ? item.link : autoLink;
              const isDiscounted =
                !!item.hargaAsli &&
                !!item.hargaDiskon &&
                item.hargaAsli > item.hargaDiskon;

              return (
                <Link
                  key={item.id}
                  href={finalLink}
                  className="group flex flex-col rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {isDiscounted && (
                        <span className="bg-danger text-white px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm self-start">
                          Promo
                        </span>
                      )}
                      {item.labelPromo && (
                        <span className="bg-warning text-white px-2.5 py-1 text-xs font-bold rounded-full tracking-wider shadow-sm self-start">
                          {item.labelPromo}
                        </span>
                      )}
                    </div>
                    {item.bestSellerBadge && (
                      <div className="absolute top-0 right-0 w-14 h-14 sm:w-20 sm:h-20 z-20 animate-pulse origin-top-right transform scale-110 drop-shadow-lg pointer-events-none">
                        <img
                          src={item.bestSellerBadge}
                          alt="Best Seller"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-medium text-sm sm:text-base text-gray-700 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="mt-auto pt-2">
                      {/* Harga Pintar */}
                      {(item.hargaAsli || item.hargaDiskon) && (
                        <div className="flex flex-col min-h-[44px] justify-end">
                          {isDiscounted ? (
                            <>
                              <span className="text-gray-400 text-xs line-through decoration-gray-300">
                                Rp{" "}
                                {(item.hargaAsli || 0).toLocaleString("id-ID")}
                              </span>
                              <span className="text-danger font-black text-base tracking-tight">
                                Rp{" "}
                                {(item.hargaDiskon || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-bold text-base tracking-tight">
                              Rp{" "}
                              {(
                                item.hargaAsli ||
                                item.hargaDiskon ||
                                0
                              ).toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* UI Element ala Shopee (Dynamic) */}
                      {(item.badgeGaransi || item.rating || item.terjual) && (
                        <div className="mt-2.5 flex flex-col gap-1.5">
                          {item.badgeGaransi && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-primary-400 to-primary-600 text-white w-fit px-1.5 py-[2px] rounded-[3px] shadow-sm">
                              <div className="flex items-center justify-center bg-white text-primary rounded-[2px] px-[3px] py-[1px]">
                                <span className="font-extrabold text-[8px] leading-none">
                                  Rp
                                </span>
                              </div>
                              <span className="text-[10px] font-medium tracking-wide">
                                {item.badgeGaransi}
                              </span>
                            </div>
                          )}

                          {(item.rating || item.terjual) && (
                            <div className="flex items-center text-xs text-gray-600 mt-0.5">
                              {item.rating && (
                                <div className="flex items-center gap-0.5 border border-yellow-400 bg-yellow-50/50 px-1.5 py-[2px] rounded-[3px]">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="#facc15"
                                    className="w-3.5 h-3.5"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="font-semibold text-gray-700 text-[11px]">
                                    {item.rating}
                                  </span>
                                </div>
                              )}

                              {item.rating && item.terjual && (
                                <span className="mx-1.5 text-gray-300">|</span>
                              )}

                              {item.terjual && (
                                <span className="truncate">{item.terjual}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
