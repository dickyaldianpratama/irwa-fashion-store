"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ShoppingBag, Heart, Shield, Star, ArrowLeft
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";
import toast from "react-hot-toast";
import BuyNowBagIcon from "@/components/ui/BuyNowBagIcon";

interface ProdukImage {
  id: string;
  url: string;
  ukuran?: string | null;
  isUtama: boolean;
}

interface KategoriPilihanProdukDetail {
  id: string;
  kategoriPilihanId: string;
  nama: string;
  harga: number;
  hargaDiskon: number | null;
  ukuran: string | null;
  deskripsi: string | null;
  images: ProdukImage[];
  kategoriPilihan: {
    id: string;
    nama: string;
    slug: string;
  };
}

export default function KategoriPilihanProdukDetailPage({
  params,
}: {
  params: Promise<{ slug: string; produkId: string }>;
}) {
  const { slug, produkId } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<KategoriPilihanProdukDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(produkId));
  const toggleWishlistStore = useWishlistStore((state) => state.toggleWishlist);

  useEffect(() => {
    fetch(`/api/kategori-pilihan-produk/detail/${produkId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setItem(d.data);
        if (d.data?.images && d.data.images.length > 0) {
          const sorted = [...d.data.images].sort(
            (a: any, b: any) => (b.isUtama ? 1 : 0) - (a.isUtama ? 1 : 0)
          );
          const sizes = d.data.ukuran
            ? d.data.ukuran.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];
          const initialSize = sorted[0]?.ukuran || sizes[0] || "";
          if (initialSize) setSelectedSize(initialSize);
        } else if (d.data?.ukuran) {
          const sizes = d.data.ukuran.split(",").map((s: string) => s.trim()).filter(Boolean);
          if (sizes[0]) setSelectedSize(sizes[0]);
        }
      })
      .catch(() => router.push(`/kategori/${slug}`))
      .finally(() => setLoading(false));
  }, [produkId, slug, router]);

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

  const sizesFromUkuran = item.ukuran
    ? item.ukuran.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const photos = item.images
    .sort((a, b) => (b.isUtama ? 1 : 0) - (a.isUtama ? 1 : 0))
    .map((img, idx) => ({
      ...img,
      ukuran: img.ukuran || sizesFromUkuran[idx] || sizesFromUkuran[0] || "",
    }));

  const activePhoto = photos[activePhotoIndex] || photos[0];

  const allSizes = Array.from(
    new Set(
      photos
        .map((p) => p.ukuran)
        .filter((s): s is string => Boolean(s))
    )
  );
  if (allSizes.length === 0 && sizesFromUkuran.length > 0) {
    allSizes.push(...sizesFromUkuran);
  }

  const handleSelectPhoto = (index: number) => {
    setActivePhotoIndex(index);
    const sz = photos[index]?.ukuran || "";
    if (sz) setSelectedSize(sz);
  };

  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    const targetIdx = photos.findIndex((p) => p.ukuran === sz);
    if (targetIdx !== -1) {
      setActivePhotoIndex(targetIdx);
    }
  };

  const isDiscounted = !!(item.hargaDiskon && item.hargaDiskon < item.harga);
  const displayPrice = item.hargaDiskon || item.harga;
  const diskonPersen = isDiscounted
    ? Math.round(((item.harga - item.hargaDiskon!) / item.harga) * 100)
    : 0;

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleAddToCart = () => {
    if (allSizes.length > 0 && !selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    addItem({
      productId: item.id,
      nama: item.nama,
      harga: displayPrice,
      gambar: activePhoto?.url || "",
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
    addItem({
      productId: item.id,
      nama: item.nama,
      harga: displayPrice,
      gambar: activePhoto?.url || "",
      ukuran: selectedSize || "-",
      warna: "-",
      jumlah: 1,
    });
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlistStore({
      id: item.id,
      type: "koleksi",
      nama: item.nama,
      link: `/kategori/${slug}/produk/${item.id}`,
      harga: displayPrice,
      hargaAsli: item.harga,
      gambar: activePhoto?.url || "",
      kategori: item.kategoriPilihan?.nama || "Kategori",
      stok: null,
      ukuranDefault: selectedSize || "-",
    });
    if (added) toast.success("Berhasil ditambahkan ke wishlist!");
    else toast.success("Dihapus dari wishlist");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-3">
          <div className="max-w-full lg:max-w-[880px] xl:max-w-[980px] mx-auto">
            <nav className="flex items-center text-xs text-gray-500 gap-1">
              <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
              <ChevronRight size={14} />
              <Link href="/kategori" className="hover:text-primary transition-colors">Kategori</Link>
              <ChevronRight size={14} />
              <Link href={`/kategori/${slug}`} className="hover:text-primary transition-colors capitalize">{item.kategoriPilihan?.nama || slug}</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 truncate font-medium">{item.nama}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container-app py-4 sm:py-6">
        <div className="max-w-[740px] lg:max-w-[780px] mx-auto bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-5 lg:gap-7 items-start">
            {/* Left: Image Gallery */}
            <div className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-none md:w-[42%] lg:w-[280px] xl:w-[300px] shrink-0 mx-auto md:mx-0">
              <div className="relative w-full aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 shadow-xs">
                {activePhoto ? (
                  <img
                    src={activePhoto.url}
                    alt={item.nama}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <ShoppingBag size={36} />
                  </div>
                )}
                {isDiscounted && (
                  <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">DISKON</div>
                )}
                {activePhoto?.ukuran && (
                  <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500">Ukuran:</span>
                    <span className="text-xs font-black text-primary">{activePhoto.ukuran}</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 p-0.5">
                  {photos.map((photo, idx) => (
                    <button
                      key={photo.id || idx}
                      type="button"
                      onClick={() => handleSelectPhoto(idx)}
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300"
                      }`}
                    >
                      <img src={photo.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      {photo.ukuran && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-black text-center py-0.5 leading-tight truncate">
                          {photo.ukuran}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full md:flex-1 min-w-0">
              <Link href={`/kategori/${slug}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-2 transition-colors">
                <ArrowLeft size={12} /> Kembali ke {item.kategoriPilihan?.nama || "Kategori"}
              </Link>

              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{item.nama}</h1>

              {/* Price */}
              <div className="mt-2.5 flex items-end gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-gray-900">{formatRupiah(displayPrice)}</span>
                {isDiscounted && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs text-gray-400 line-through">{formatRupiah(item.harga)}</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{diskonPersen}%</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100 my-3.5" />

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-900">Pilih Ukuran</h3>
                    {selectedSize && <span className="text-xs text-primary font-bold">Dipilih: {selectedSize}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSelectSize(size)}
                        className={`min-w-[46px] h-9 px-2.5 rounded-lg border-2 font-bold text-xs transition-all cursor-pointer ${
                          selectedSize === size
                            ? "bg-primary border-primary text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              {item.deskripsi && (
                <div className="mb-3.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-700 mb-1">Deskripsi Produk</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{item.deskripsi}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-2.5 mt-3.5">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-11 py-2.5 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all bg-white border-2 border-primary text-primary hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingBag size={17} />
                  + Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-11 py-2.5 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] cursor-pointer"
                >
                  <BuyNowBagIcon size={17} />
                  Beli Sekarang
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500 shadow-xs"
                      : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                  }`}
                  title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={19}
                    className={`transition-transform duration-200 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : ""}`}
                  />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-3.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-gray-50/80 rounded-xl border border-gray-100">
                  <Shield size={16} className="text-primary" />
                  <span className="text-[9px] sm:text-[10px] text-gray-600 leading-tight">Garansi Tukar Ukuran</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-gray-50/80 rounded-xl border border-gray-100">
                  <ShoppingBag size={16} className="text-primary" />
                  <span className="text-[9px] sm:text-[10px] text-gray-600 leading-tight">Bisa Pick-up di Toko</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-gray-50/80 rounded-xl border border-gray-100">
                  <Star size={16} className="text-primary" />
                  <span className="text-[9px] sm:text-[10px] text-gray-600 leading-tight">Produk Pilihan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
