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
import BuyNowBagIcon from "@/components/ui/BuyNowBagIcon";

interface KoleksiPhotoItem {
  id: string;
  image: string;
  ukuran: string[];
  stok?: number;
}

interface KoleksiItem {
  id: string;
  title: string;
  image: string;
  itemsData?: string | null;
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
  const [photoItems, setPhotoItems] = useState<KoleksiPhotoItem[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  useEffect(() => {
    fetch(`/api/koleksi/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setItem(d.data);
        let parsed: KoleksiPhotoItem[] = [];
        if (d.data.itemsData) {
          try {
            const arr = JSON.parse(d.data.itemsData);
            if (Array.isArray(arr) && arr.length > 0) {
              parsed = arr.map((p: any, idx: number) => ({
                id: p.id || `item-${idx + 1}`,
                image: p.image || "",
                ukuran:
                  Array.isArray(p.ukuran) && p.ukuran.length > 0
                    ? [p.ukuran[0]]
                    : typeof p.ukuran === "string" && p.ukuran
                      ? [p.ukuran]
                      : [],
                stok: typeof p.stok === "number" ? p.stok : undefined,
              }));
            }
          } catch (e) {}
        }
        if (parsed.length === 0) {
          const firstUkuran = d.data.ukuran
            ? d.data.ukuran
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)[0]
            : undefined;
          parsed = [
            {
              id: "1",
              image: d.data.image,
              ukuran: firstUkuran ? [firstUkuran] : [],
              stok: d.data.stok ?? undefined,
            },
          ];
        }
        setPhotoItems(parsed);
        setActivePhotoIndex(0);
        if (parsed[0]?.ukuran?.[0]) {
          setSelectedSize(parsed[0].ukuran[0]);
        }
      })
      .catch(() => router.push("/koleksi-terpopuler"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSelectPhoto = (index: number) => {
    setActivePhotoIndex(index);
    const sz = photoItems[index]?.ukuran?.[0] || "";
    setSelectedSize(sz);
  };

  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    const targetIdx = photoItems.findIndex((p) => p.ukuran?.[0] === sz);
    if (targetIdx !== -1) {
      setActivePhotoIndex(targetIdx);
    }
  };

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

  const activePhoto =
    photoItems[activePhotoIndex] ||
    photoItems[0] || { image: item.image, ukuran: [] };
  const allSizes = Array.from(
    new Set(
      photoItems
        .map((p) => p.ukuran?.[0])
        .filter((s): s is string => Boolean(s)),
    ),
  );
  const currentStock =
    activePhoto.stok !== undefined && activePhoto.stok !== null
      ? activePhoto.stok
      : (item.stok ?? null);
  const isHabis = currentStock !== null && currentStock === 0;
  const isHampirHabis =
    currentStock !== null && currentStock > 0 && currentStock <= 5;
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

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const handleAddToCart = () => {
    if (allSizes.length > 0 && !selectedSize) {
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
      gambar: activePhoto.image,
      ukuran: selectedSize || "-",
      warna: "-",
      jumlah: 1,
    });
    toast.success("Berhasil ditambahkan ke keranjang!");
    openCart();
  };

  const handleBuyNow = () => {
    if (allSizes.length > 0 && !selectedSize) {
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
      gambar: activePhoto.image,
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
          <div className="max-w-full lg:max-w-[880px] xl:max-w-[980px] mx-auto">
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
      </div>

      <div className="container-app py-4 sm:py-8">
        <div className="max-w-full lg:max-w-[880px] xl:max-w-[980px] mx-auto lg:bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm lg:p-8">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 xl:gap-10 items-start">
            <div className="w-full md:w-[45%] lg:w-[320px] xl:w-[350px] shrink-0 mx-auto md:mx-0">
              <div className="relative w-full aspect-square sm:aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <img
                  src={activePhoto.image}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-all duration-300 ${isHabis ? "grayscale-[30%]" : ""}`}
                />
                {isHabis && (
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
                    <span className="bg-red-600 text-white font-black text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xl border-2 border-white">
                      Stok Habis
                    </span>
                  </div>
                )}
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
                {activePhoto.ukuran && activePhoto.ukuran.length > 0 && (
                  <div
                    className={`absolute ${
                      item.labelPromo ? "bottom-8" : "bottom-3"
                    } left-3 z-10 flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm`}
                  >
                    <span className="text-[11px] font-bold text-gray-500">
                      Ukuran:
                    </span>
                    <span className="text-xs font-black text-primary">
                      {activePhoto.ukuran[0]}
                    </span>
                    {currentStock !== null && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span
                          className={`text-xs font-bold ${
                            isHabis
                              ? "text-red-500"
                              : isHampirHabis
                                ? "text-orange-500"
                                : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {isHabis ? "Habis" : `${currentStock} pcs`}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Thumbnails Gallery */}
              {photoItems.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {photoItems.map((p, idx) => {
                    const pSize = p.ukuran?.[0];
                    const isActive = activePhotoIndex === idx;
                    const isOutOfStock = p.stok !== undefined && p.stok === 0;
                    return (
                      <button
                        key={p.id || idx}
                        type="button"
                        onClick={() => handleSelectPhoto(idx)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          isActive
                            ? "border-primary ring-2 ring-primary/30 scale-105"
                            : "border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300"
                        } ${isOutOfStock ? "grayscale opacity-50" : ""}`}
                      >
                        <img
                          src={p.image}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {pSize && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-white font-black text-center py-0.5 truncate px-0.5">
                            {pSize} {isOutOfStock ? "(Habis)" : ""}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
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
                    <span className="text-sm text-gray-500">
                      {item.terjual}
                    </span>
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
                  <span className="text-xs font-medium">
                    {item.badgeGaransi}
                  </span>
                </div>
              )}

              <hr className="border-gray-100 my-4" />

              {allSizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Pilih Ukuran
                      </h3>
                      {photoItems.length > 1 && (
                        <span className="text-xs text-gray-500 font-normal">
                          (Foto {activePhotoIndex + 1})
                        </span>
                      )}
                    </div>
                    {selectedSize && (
                      <span className="text-sm text-primary font-bold">
                        Dipilih: {selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      const sizePhoto = photoItems.find((p) => p.ukuran?.[0] === size);
                      const sizeStok =
                        sizePhoto && typeof sizePhoto.stok === "number"
                          ? sizePhoto.stok
                          : (item.stok ?? 10);
                      const isSizeOutOfStock = sizeStok <= 0;

                      return (
                        <button
                          key={size}
                          onClick={() => handleSelectSize(size)}
                          className={`relative min-w-[56px] h-12 px-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center leading-tight cursor-pointer ${
                            isSizeOutOfStock
                              ? isSelected
                                ? "bg-red-50 border-red-500 text-red-600 shadow-xs"
                                : "bg-gray-100 border-gray-200 text-gray-400 hover:border-red-300"
                              : isSelected
                                ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"
                          }`}
                        >
                          <span className={isSizeOutOfStock ? "line-through text-gray-400" : ""}>
                            {size}
                          </span>
                          {isSizeOutOfStock ? (
                            <span className="text-[9px] font-black text-red-500">Habis</span>
                          ) : (
                            <span className="text-[9px] font-normal opacity-75">{sizeStok} pcs</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isHabis ? (
                <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-lg">
                    ✕
                  </div>
                  <div>
                    <h4 className="font-bold text-red-800 text-sm">Stok Habis (0 pcs)</h4>
                    <p className="text-xs text-red-600 mt-0.5">
                      Pakaian untuk ukuran <b>{selectedSize || activePhoto.ukuran?.[0] || "-"}</b> ini sedang habis terjual dan <b>tidak bisa dipesan</b>.
                    </p>
                  </div>
                </div>
              ) : currentStock !== null ? (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium mb-5 ${
                    isHampirHabis
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  <Package size={14} />
                  {isHampirHabis
                    ? `Hampir Habis! Sisa ${currentStock} pcs`
                    : `Stok: ${currentStock} pcs`}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isHabis}
                  className={`flex-1 h-13 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isHabis
                      ? "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : "bg-white border-2 border-primary text-primary hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <ShoppingBag size={20} />
                  {isHabis ? "Stok Habis" : "+ Keranjang"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isHabis}
                  className={`flex-1 h-13 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isHabis
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60 shadow-none"
                      : "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <BuyNowBagIcon size={20} />
                  {isHabis ? "Tidak Bisa Dipesan" : "Beli Sekarang"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
                  <Shield size={18} className="text-primary" />
                  <span className="text-[10px] text-gray-600 leading-tight">
                    Garansi Tukar Ukuran
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
                  <ShoppingBag size={18} className="text-primary" />
                  <span className="text-[10px] text-gray-600 leading-tight">
                    Bisa Pick-up di Toko
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
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
    </div>
  );
}
