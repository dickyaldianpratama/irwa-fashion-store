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
        if (d.data?.ukuran) {
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

  const photos = item.images.sort((a, b) => (b.isUtama ? 1 : 0) - (a.isUtama ? 1 : 0));
  const activePhoto = photos[activePhotoIndex] || photos[0];
  const allSizes = item.ukuran
    ? item.ukuran.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
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

      <div className="container-app py-4 sm:py-8">
        <div className="max-w-full lg:max-w-[880px] xl:max-w-[980px] mx-auto lg:bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm lg:p-8">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 xl:gap-10 items-start">
            {/* Left: Image Gallery */}
            <div className="w-full md:w-[45%] lg:w-[320px] xl:w-[350px] shrink-0 mx-auto md:mx-0">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                {activePhoto ? (
                  <img
                    src={activePhoto.url}
                    alt={item.nama}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <ShoppingBag size={40} />
                  </div>
                )}
                {isDiscounted && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">DISKON</div>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activePhotoIndex === idx
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300"
                      }`}
                    >
                      <img src={photo.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full md:flex-1">
              <Link href={`/kategori/${slug}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-3 transition-colors">
                <ArrowLeft size={12} /> Kembali ke {item.kategoriPilihan?.nama || "Kategori"}
              </Link>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{item.nama}</h1>

              {/* Price */}
              <div className="mt-4 flex items-end gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">{formatRupiah(displayPrice)}</span>
                {isDiscounted && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400 line-through">{formatRupiah(item.harga)}</span>
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">-{diskonPersen}%</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100 my-4" />

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Pilih Ukuran</h3>
                    {selectedSize && <span className="text-sm text-primary font-bold">Dipilih: {selectedSize}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[56px] h-10 px-3 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
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

              {/* Deskripsi */}
              {item.deskripsi && (
                <div className="mb-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Deskripsi Produk</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.deskripsi}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 mt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-13 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all bg-white border-2 border-primary text-primary hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingBag size={20} />
                  + Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-13 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-[0.98] cursor-pointer"
                >
                  <BuyNowBagIcon size={20} />
                  Beli Sekarang
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`w-13 h-13 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                      : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                  }`}
                  title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={22}
                    className={`transition-transform duration-200 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : ""}`}
                  />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
                  <Shield size={18} className="text-primary" />
                  <span className="text-[10px] text-gray-600 leading-tight">Garansi Tukar Ukuran</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
                  <ShoppingBag size={18} className="text-primary" />
                  <span className="text-[10px] text-gray-600 leading-tight">Bisa Pick-up di Toko</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 p-2 bg-white lg:bg-gray-50/80 rounded-xl border border-gray-100">
                  <Star size={18} className="text-primary" />
                  <span className="text-[10px] text-gray-600 leading-tight">Produk Pilihan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
