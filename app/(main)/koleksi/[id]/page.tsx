"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ShoppingBag,
  Zap,
  Shield,
  Star,
  Package,
  ThumbsUp,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";

interface KoleksiItem {
  id: string;
  title: string;
  image: string;
  link: string | null;
  hargaAsli: number | null;
  hargaDiskon: number | null;
  labelPromo: string | null;
  bestSellerBadge: string | null;
  badgeGaransi: string | null;
  rating: string | null;
  terjual: string | null;
  ukuran: string | null;
  stok: number | null;
}

export default function KoleksiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<KoleksiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  useEffect(() => {
    fetch(`/api/koleksi/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setItem(d.data);
        const sizes = d.data.ukuran
          ? d.data.ukuran
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      })
      .catch(() => router.push("/koleksi-terpopuler"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const sizes = item.ukuran
    ? item.ukuran
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const isDiscounted = !!(
    item.hargaAsli &&
    item.hargaDiskon &&
    item.hargaAsli > item.hargaDiskon
  );
  const displayPrice = item.hargaDiskon || item.hargaAsli || 0;
  const diskonPersen = isDiscounted
    ? Math.round(
        ((item.hargaAsli! - item.hargaDiskon!) / item.hargaAsli!) * 100,
      )
    : 0;
  const isHampirHabis = item.stok !== null && item.stok <= 5;
  const isHabis = item.stok !== null && item.stok === 0;

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    if (isHabis) {
      toast.error("Stok produk habis");
      return;
    }
    addItem({
      productId: item.id,
      nama: item.title,
      harga: displayPrice,
      gambar: item.image,
      ukuran: selectedSize || "-",
      warna: "-",
      jumlah: 1,
    });
    toast.success("Berhasil ditambahkan ke keranjang!");
    openCart();
  };

  const handleBuyNow = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    if (isHabis) {
      toast.error("Stok produk habis");
      return;
    }
    addItem({
      productId: item.id,
      nama: item.title,
      harga: displayPrice,
      gambar: item.image,
      ukuran: selectedSize || "-",
      warna: "-",
      jumlah: 1,
    });
    router.push("/checkout");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-3">
          <nav className="flex items-center text-xs text-gray-500 gap-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <ChevronRight size={14} />
            <Link
              href="/koleksi-terpopuler"
              className="hover:text-primary transition-colors"
            >
              Koleksi Terpopuler
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 truncate font-medium">
              {item.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-app py-4 sm:py-8">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          <div className="w-full md:w-[45%]">
            <div className="relative w-full aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.labelPromo && (
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-warning to-orange-500 py-1 text-center">
                  <span className="text-white text-xs font-bold tracking-wider uppercase">
                    {item.labelPromo}
                  </span>
                </div>
              )}
              {isDiscounted && (
                <div className="absolute top-3 left-3 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase">
                  Promo
                </div>
              )}
              {item.bestSellerBadge && (
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20">
                  <img
                    src={item.bestSellerBadge}
                    alt="Best Seller"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {item.title}
            </h1>

            {(item.rating || item.terjual) && (
              <div className="flex items-center gap-3 mt-2">
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {item.rating}
                    </span>
                  </div>
                )}
                {item.rating && item.terjual && (
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                )}
                {item.terjual && (
                  <span className="text-sm text-gray-500">{item.terjual}</span>
                )}
              </div>
            )}

            <div className="mt-4 flex items-end gap-3">
              <span className="text-2xl sm:text-3xl font-black text-gray-900">
                {formatRupiah(displayPrice)}
              </span>
              {isDiscounted && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-400 line-through">
                    {formatRupiah(item.hargaAsli!)}
                  </span>
                  <span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    -{diskonPersen}%
                  </span>
                </div>
              )}
            </div>

            {item.badgeGaransi && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                <ThumbsUp size={14} className="-mt-0.5" />
                <span className="text-xs font-medium">{item.badgeGaransi}</span>
              </div>
            )}

            <hr className="border-gray-100 my-4" />

            {sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Pilih Ukuran
                  </h3>
                  {selectedSize && (
                    <span className="text-sm text-primary font-bold">
                      Dipilih: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-11 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedSize === size
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.stok !== null && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${
                  isHabis
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : isHampirHabis
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                <Package size={14} />
                {isHabis
                  ? "Stok Habis"
                  : isHampirHabis
                    ? `Hampir Habis! Sisa ${item.stok} pcs`
                    : `Stok: ${item.stok} pcs`}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isHabis}
                className="flex-1 h-13 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <ShoppingBag size={20} />+ Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isHabis}
                className="flex-1 h-13 py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Zap size={20} />
                Beli Sekarang
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
                <Shield size={18} className="text-primary" />
                <span className="text-[10px] text-gray-600 leading-tight">
                  Garansi Tukar Ukuran
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
                <ShoppingBag size={18} className="text-primary" />
                <span className="text-[10px] text-gray-600 leading-tight">
                  Bisa Pick-up di Toko
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
                <Star size={18} className="text-primary" />
                <span className="text-[10px] text-gray-600 leading-tight">
                  Produk Terpopuler
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
