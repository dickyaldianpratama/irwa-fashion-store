"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import toast from "react-hot-toast";

export interface KoleksiItemData {
  id: string;
  image: string;
  ukuran: string[];
  stok?: number;
}

export interface KoleksiCardProps {
  item: {
    id: string;
    title: string;
    image: string;
    itemsData?: string | null;
    link?: string | null;
    hargaAsli?: number | null;
    hargaDiskon?: number | null;
    labelPromo?: string | null;
    bestSellerBadge?: string | null;
    badgeGaransi?: string | null;
    rating?: string | null;
    terjual?: string | null;
    ukuran?: string | null;
    stok?: number | null;
  };
  cardClassName?: string;
  aspectRatioClassName?: string;
}

export default function KoleksiCard({
  item,
  cardClassName = "group flex flex-col rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow relative",
  aspectRatioClassName = "aspect-square",
}: KoleksiCardProps) {
  const photoItems: KoleksiItemData[] = (() => {
    if (item.itemsData) {
      try {
        const parsed = JSON.parse(item.itemsData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p, idx) => ({
            id: p.id || `item-${idx + 1}`,
            image: p.image || "",
            ukuran:
              Array.isArray(p.ukuran) && p.ukuran.length > 0
                ? [p.ukuran[0]]
                : typeof p.ukuran === "string" && p.ukuran
                  ? [p.ukuran]
                  : [],
            stok: typeof p.stok === "number" ? p.stok : (item.stok ?? undefined),
          }));
        }
      } catch (e) {}
    }
    const firstUkuran = item.ukuran
      ? item.ukuran
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)[0]
      : undefined;
    return [
      {
        id: "1",
        image: item.image,
        ukuran: firstUkuran ? [firstUkuran] : [],
        stok: item.stok ?? undefined,
      },
    ];
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll / slideshow jika memiliki lebih dari 1 foto
  useEffect(() => {
    if (photoItems.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photoItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [photoItems.length, isHovered]);

  const activePhoto = photoItems[currentIndex] || photoItems[0];
  const finalLink = `/koleksi/${item.id}`;
  const isDiscounted =
    !!item.hargaAsli &&
    !!item.hargaDiskon &&
    item.hargaAsli > item.hargaDiskon;

  const isWishlisted = useWishlistStore((state) => state.isWishlisted(item.id));
  const toggleWishlistStore = useWishlistStore((state) => state.toggleWishlist);

  const handleToggleWishlist = () => {
    const added = toggleWishlistStore({
      id: item.id,
      type: "koleksi",
      nama: item.title,
      link: `/koleksi/${item.id}`,
      harga: item.hargaDiskon || item.hargaAsli || 0,
      hargaAsli: item.hargaAsli,
      gambar: activePhoto.image || item.image,
      kategori: "Koleksi Terpopuler",
      stok: item.stok,
      ukuranDefault: activePhoto.ukuran?.[0] || item.ukuran || "-",
    });
    if (added) {
      toast.success("Disimpan ke wishlist");
    } else {
      toast.success("Dihapus dari wishlist");
    }
  };

  return (
    <Link
      href={finalLink}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cardClassName}
    >
      <div
        className={`relative w-full ${aspectRatioClassName} bg-gray-100 overflow-hidden shrink-0`}
      >
        {/* Gambar dengan transisi otomatis */}
        {photoItems.map((photo, idx) => (
          <img
            key={photo.id || idx}
            src={photo.image}
            alt={`${item.title} - ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          />
        ))}

        {/* Promo Badge & Stok Habis Badge */}
        <div className="absolute top-2 left-2 right-12 sm:right-16 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
          {activePhoto.stok === 0 && (
            <span className="bg-red-600/95 text-white px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-sm uppercase tracking-wider shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Stok Habis
            </span>
          )}
          {isDiscounted && activePhoto.stok !== 0 && (
            <span className="bg-danger text-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-sm uppercase tracking-wider shadow-sm">
              Promo
            </span>
          )}
        </div>

        {/* Overlay Habis Terjual jika seluruh stok card = 0 */}
        {item.stok === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-25 pointer-events-none">
            <span className="bg-red-600 text-white font-black text-[11px] sm:text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xl border border-white/40">
              Habis Terjual
            </span>
          </div>
        )}

        {/* Label Promo Bar */}
        {item.labelPromo && (
          <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-r from-warning to-orange-500 shadow-sm border-t border-white/20">
            <div className="px-2 py-[3px] text-center">
              <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase truncate block drop-shadow-sm">
                {item.labelPromo}
              </span>
            </div>
          </div>
        )}

        {/* Best Seller Badge */}
        {item.bestSellerBadge && (
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 z-20 animate-pulse origin-top-right transform scale-110 drop-shadow-lg pointer-events-none">
            <img
              src={item.bestSellerBadge}
              alt="Best Seller"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Indikator Jumlah Foto */}
        {photoItems.length > 1 && (
          <div className="absolute top-2 right-10 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-sm">
            <span>
              {currentIndex + 1}/{photoItems.length}
            </span>
          </div>
        )}

        {/* Floating Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleWishlist();
          }}
          className={`absolute top-2 right-2 z-25 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
            isWishlisted
              ? "bg-white text-red-500 ring-2 ring-red-500/20"
              : "bg-white/85 hover:bg-white text-gray-500 hover:text-red-500 backdrop-blur-xs"
          }`}
          title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
          aria-label="Wishlist"
        >
          <Heart size={15} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Badge Ukuran & Stok Pakaian untuk Foto yang Aktif */}
        {activePhoto.ukuran && activePhoto.ukuran.length > 0 && (
          <div
            className={`absolute ${
              item.labelPromo ? "bottom-6" : "bottom-2"
            } left-2 z-10 flex items-center gap-1.5 backdrop-blur-sm px-2 py-0.5 rounded-md border shadow-xs ${
              activePhoto.stok === 0
                ? "bg-red-50/95 border-red-200 text-red-600"
                : "bg-white/95 dark:bg-gray-900/90 border-gray-100"
            }`}
          >
            <span className="text-[9px] font-bold text-gray-500">Size:</span>
            <span
              className={`text-[10px] font-black ${
                activePhoto.stok === 0 ? "text-red-600 line-through" : "text-primary"
              }`}
            >
              {activePhoto.ukuran[0]}
            </span>
            {activePhoto.stok !== undefined && (
              <>
                <span className="text-gray-300 text-[9px]">|</span>
                <span
                  className={`text-[9px] font-bold ${
                    activePhoto.stok === 0
                      ? "text-red-600 font-black"
                      : activePhoto.stok <= 5
                        ? "text-orange-500 font-black"
                        : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {activePhoto.stok === 0
                    ? "Habis"
                    : `${activePhoto.stok} pcs`}
                </span>
              </>
            )}
          </div>
        )}

        {/* Dots indicator di bagian bawah */}
        {photoItems.length > 1 && (
          <div
            className={`absolute ${
              item.labelPromo ? "bottom-6" : "bottom-2"
            } right-2 z-10 flex items-center gap-1`}
          >
            {photoItems.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-3 bg-primary" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informasi Card */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-xs sm:text-sm text-gray-700 leading-snug group-hover:text-primary transition-colors truncate">
            {item.title}
          </h3>

          <div className="mt-2">
            {/* Harga */}
            {(item.hargaAsli || item.hargaDiskon) && (
              <div className="flex flex-col">
                {isDiscounted ? (
                  <>
                    <span className="text-gray-400 text-[10px] sm:text-[11px] line-through decoration-gray-300">
                      Rp {(item.hargaAsli || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-danger font-black text-sm sm:text-base tracking-tight">
                      Rp {(item.hargaDiskon || 0).toLocaleString("id-ID")}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-900 font-bold text-sm sm:text-base tracking-tight">
                    Rp{" "}
                    {(item.hargaAsli || item.hargaDiskon || 0).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                )}
              </div>
            )}

            {/* Badges / Ratings */}
            {(item.badgeGaransi || item.rating || item.terjual) && (
              <div className="mt-2 flex flex-col gap-1.5">
                {item.badgeGaransi && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-primary-400 to-primary-600 text-white w-fit pl-1 pr-1.5 py-[2px] rounded-[3px] shadow-sm">
                    <span className="text-[9px] font-medium tracking-wide">
                      {item.badgeGaransi}
                    </span>
                  </div>
                )}

                {(item.rating || item.terjual) && (
                  <div className="flex items-center text-[10px] sm:text-[11px] text-gray-600 mt-0.5">
                    {item.rating && (
                      <div className="flex items-center gap-0.5 border border-yellow-400 bg-yellow-50/50 px-1 py-[1px] rounded-[2px]">
                        <span className="font-semibold text-gray-700">
                          ★ {item.rating}
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
      </div>
    </Link>
  );
}
