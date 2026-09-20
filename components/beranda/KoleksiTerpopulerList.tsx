"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface KoleksiItem {
  id: string;
  title: string;
  image: string;
  link: string | null;
  hargaAsli?: number | null;
  hargaDiskon?: number | null;
  labelPromo?: string | null;
  bestSellerBadge?: string | null;
  badgeGaransi?: string | null;
  rating?: string | null;
  terjual?: string | null;
}

interface Props {
  items: KoleksiItem[];
}

export default function KoleksiTerpopulerList({ items }: Props) {
  const displayedItems = items.slice(0, 5);
  const hasMore = items.length > 5;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    router.push("/koleksi-terpopuler");
  };

  return (
    <section id="belanja" className="py-10 sm:py-14 bg-gray-50">
      <div className="container-app">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="section-title !mb-0 text-xl sm:text-2xl">
            Koleksi Terpopuler
          </h2>

          {hasMore && (
            <button
              onClick={handleNavigate}
              disabled={isLoading}
              className="btn btn-secondary text-sm self-start md:self-auto shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  Memuat <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                "Lihat Semua"
              )}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Belum ada koleksi terpopuler.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {displayedItems.map((item) => {
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
                  className="group flex flex-col rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow relative"
                >
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                      {isDiscounted && (
                        <span className="bg-danger text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shadow-sm self-start">
                          Promo
                        </span>
                      )}
                      {item.labelPromo && (
                        <span className="bg-warning text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full tracking-wider shadow-sm self-start">
                          {item.labelPromo}
                        </span>
                      )}
                    </div>
                    {item.bestSellerBadge && (
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 z-20 animate-pulse origin-top-right transform scale-110 drop-shadow-lg pointer-events-none">
                        <img
                          src={item.bestSellerBadge}
                          alt="Best Seller"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-medium text-xs sm:text-sm text-gray-700 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="mt-auto pt-2">
                      {/* Harga Pintar */}
                      {(item.hargaAsli || item.hargaDiskon) && (
                        <div className="flex flex-col min-h-[38px] justify-end">
                          {isDiscounted ? (
                            <>
                              <span className="text-gray-400 text-[10px] sm:text-[11px] line-through decoration-gray-300">
                                Rp{" "}
                                {(item.hargaAsli || 0).toLocaleString("id-ID")}
                              </span>
                              <span className="text-danger font-black text-sm sm:text-base tracking-tight">
                                Rp{" "}
                                {(item.hargaDiskon || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-bold text-sm sm:text-base tracking-tight">
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
                        <div className="mt-2 flex flex-col gap-1.5">
                          {item.badgeGaransi && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-primary-400 to-primary-600 text-white w-fit px-1.5 py-[2px] rounded-[3px] shadow-sm">
                              <div className="flex items-center justify-center bg-white text-primary rounded-[2px] p-[2px]">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-[9px] h-[9px]"
                                >
                                  <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z" />
                                </svg>
                              </div>
                              <span className="text-[9px] font-medium tracking-wide">
                                {item.badgeGaransi}
                              </span>
                            </div>
                          )}

                          {(item.rating || item.terjual) && (
                            <div className="flex items-center text-[10px] sm:text-[11px] text-gray-600 mt-0.5">
                              {item.rating && (
                                <div className="flex items-center gap-0.5 border border-yellow-400 bg-yellow-50/50 px-1 py-[1px] rounded-[2px]">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="#facc15"
                                    className="w-3 h-3"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="font-semibold text-gray-700">
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
    </section>
  );
}
