import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipe data untuk Dummy Produk
export interface ProductType {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number; // Jika ada diskon
  rating: number;
  soldCount: number;
  badges?: ("NEW" | "SALE" | "BESTSELLER" | "PO")[];
}

interface ProductCardProps {
  product: ProductType;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format harga ke Rupiah
  const formatRp = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const isDiscounted = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group bg-white rounded-[12px] shadow-sm hover:shadow-card-hover border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
    >
      {/* Container Foto Produk (Rasio 4:5 sesuai PRD) */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges / Label */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {product.badges.map((badge) => {
              let badgeClass = "";
              let badgeText = badge;
              
              if (badge === "NEW") {
                badgeClass = "bg-success text-white";
                badgeText = "Baru";
              } else if (badge === "SALE") {
                badgeClass = "bg-danger text-white";
                // Hitung persen diskon jika ada original price
                if (isDiscounted) {
                  const percent = Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
                  badgeText = `-${percent}%`;
                }
              } else if (badge === "BESTSELLER") {
                badgeClass = "bg-warning text-white";
                badgeText = "Terlaris";
              } else if (badge === "PO") {
                badgeClass = "bg-preorder text-white";
                badgeText = "Pre-Order";
              }

              return (
                <span
                  key={badge}
                  className={cn(
                    "px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-pill uppercase tracking-wider shadow-sm",
                    badgeClass
                  )}
                >
                  {badgeText}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Konten Detail Produk */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1.5">
        {/* Nama Produk */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Rating & Terjual */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-1">
          <div className="flex items-center text-promo">
            <Star size={12} className="fill-current" />
            <span className="font-medium ml-1 text-gray-600">{product.rating}</span>
          </div>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>Terjual {product.soldCount}</span>
        </div>

        {/* Harga */}
        <div className="flex flex-col mt-0.5">
          {isDiscounted ? (
            <>
              <span className="text-gray-400 text-[11px] sm:text-xs line-through">
                {formatRp(product.originalPrice!)}
              </span>
              <span className="text-danger font-bold text-sm sm:text-base">
                {formatRp(product.price)}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-bold text-sm sm:text-base mt-auto">
              {formatRp(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
