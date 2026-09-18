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
          <h2 className="section-title !mb-0 text-xl sm:text-2xl">Koleksi Terpopuler</h2>
          
          {hasMore && (
            <button 
              onClick={handleNavigate}
              disabled={isLoading}
              className="btn btn-secondary text-sm self-start md:self-auto shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Memuat <Loader2 size={16} className="animate-spin" /></>
              ) : (
                "Lihat Semua"
              )}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Belum ada koleksi terpopuler.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {displayedItems.map((item) => {
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
                <Link key={item.id} href={finalLink} className="group block rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {isDiscounted && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-danger text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                          Promo
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    {/* Render Harga Pintar */}
                    {(item.hargaAsli || item.hargaDiskon) && (
                      <div className="mt-2 flex flex-col">
                        {isDiscounted ? (
                          <>
                            <span className="text-gray-400 text-[11px] sm:text-xs line-through">
                              Rp {item.hargaAsli.toLocaleString('id-ID')}
                            </span>
                            <span className="text-danger font-bold text-sm sm:text-base">
                              Rp {item.hargaDiskon.toLocaleString('id-ID')}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 font-bold text-sm sm:text-base">
                            Rp {(item.hargaAsli || item.hargaDiskon).toLocaleString('id-ID')}
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
    </section>
  );
}
