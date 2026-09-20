"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import KoleksiCard from "@/components/beranda/KoleksiCard";

interface KoleksiItem {
  id: string;
  title: string;
  image: string;
  itemsData?: string | null;
  link: string | null;
  hargaAsli?: number | null;
  hargaDiskon?: number | null;
  labelPromo?: string | null;
  bestSellerBadge?: string | null;
  badgeGaransi?: string | null;
  rating?: string | null;
  terjual?: string | null;
  ukuran?: string | null;
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
            {displayedItems.map((item) => (
              <KoleksiCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
