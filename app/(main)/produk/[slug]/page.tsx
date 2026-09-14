"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Truck, Heart, ShoppingBag, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import ProductGallery from "@/components/produk/ProductGallery";
import SizeSelector from "@/components/produk/SizeSelector";
import ColorSwatch from "@/components/produk/ColorSwatch";

// Store Zustand
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";

// Helper map warna ke hex untuk ColorSwatch
const colorToHex: Record<string, string> = {
  "Hitam": "#111827",
  "Putih": "#FFFFFF",
  "Navy Blue": "#1e3a8a",
  "Olive Green": "#4b5320",
  "Khaki": "#c3b091",
  "Abu-abu": "#6b7280",
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Zustand Actions
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/produk/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const { data } = await res.json();
        
        // Setup initial selections
        const uniqueColors = Array.from(new Set(data.varian.map((v: any) => v.warna)));
        const uniqueSizes = Array.from(new Set(data.varian.map((v: any) => v.ukuran)));
        
        if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0] as string);
        if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0] as string);
        
        setProduct(data);
        
        // Fetch wishlist status
        const wlRes = await fetch("/api/akun/wishlist");
        if (wlRes.ok) {
          const wlData = await wlRes.json();
          const wishlisted = wlData.data?.some((w: any) => w.produkId === data.id);
          setIsWishlisted(wishlisted);
        }

      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const toggleWishlist = async () => {
    if (!product) return;
    
    // Optimistic
    const newStatus = !isWishlisted;
    setIsWishlisted(newStatus);
    
    try {
      if (newStatus) {
        await fetch("/api/akun/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ produkId: product.id })
        });
        toast.success("Disimpan ke wishlist");
      } else {
        await fetch(`/api/akun/wishlist?produkId=${product.id}`, { method: "DELETE" });
        toast.success("Dihapus dari wishlist");
      }
    } catch (e) {
      setIsWishlisted(!newStatus); // revert
      toast.error("Gagal mengubah wishlist");
    }
  };

  if (loading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>;
  if (error || !product) return <div className="py-32 text-center text-red-500 font-bold">Produk tidak ditemukan.</div>;

  // Derive UI data
  const imageUrls = product.images.length > 0 ? product.images.map((img: any) => img.url) : ["https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800"];
  const uniqueSizes = Array.from(new Set(product.varian.map((v: any) => v.ukuran))) as string[];
  const uniqueColors = Array.from(new Set(product.varian.map((v: any) => v.warna))) as string[];
  
  const colorsForSwatch = uniqueColors.map(c => ({
    name: c,
    hex: colorToHex[c] || "#9ca3af" // fallback grey
  }));

  const diskonPersen = product.hargaDiskon 
    ? Math.round(((product.hargaAsli - product.hargaDiskon) / product.hargaAsli) * 100) 
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      nama: product.nama,
      harga: product.hargaDiskon || product.hargaAsli,
      gambar: imageUrls[0],
      ukuran: selectedSize,
      warna: selectedColor,
      jumlah: 1,
    });
    toast.success("Berhasil ditambahkan ke keranjang!");
    openCart();
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      nama: product.nama,
      harga: product.hargaDiskon || product.hargaAsli,
      gambar: imageUrls[0],
      ukuran: selectedSize,
      warna: selectedColor,
      jumlah: 1,
    });
    router.push("/checkout");
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <main className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl animate-fade-in">
      <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 font-medium">
        <Link href="/" className="hover:text-primary transition-colors flex-shrink-0">Beranda</Link>
        <ChevronRight size={16} className="mx-1 flex-shrink-0" />
        <Link href={`/kategori/${product.kategori?.slug}`} className="hover:text-primary transition-colors flex-shrink-0">
          {product.kategori?.nama || "Kategori"}
        </Link>
        <ChevronRight size={16} className="mx-1 flex-shrink-0" />
        <span className="text-gray-900 truncate min-w-0">{product.nama}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative min-w-0">
        
        <div className="w-full md:w-[45%] lg:w-[40%] xl:w-[40%] min-w-0">
          <div className="md:sticky md:top-24">
            <ProductGallery images={imageUrls} />
          </div>
        </div>

        <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
              {product.nama}
            </h1>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center text-yellow-500">
                <Star size={16} className="fill-current" />
                <span className="ml-1 font-semibold text-gray-900">{product.rating || "5.0"}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="text-gray-600">Terjual {product.terjual || 0}</span>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="text-green-600 font-medium flex items-center gap-1">
                <ShieldCheck size={16} /> Ready Stock
              </span>
            </div>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {formatRupiah(product.hargaDiskon || product.hargaAsli)}
              </span>
              {product.hargaDiskon && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg text-gray-400 line-through decoration-gray-400/50">
                    {formatRupiah(product.hargaAsli)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-md">
                    -{diskonPersen}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 my-4" />

          <div className="space-y-5 mb-6">
            {colorsForSwatch.length > 0 && (
              <ColorSwatch 
                colors={colorsForSwatch} 
                selectedColor={selectedColor} 
                onSelect={setSelectedColor} 
              />
            )}
            
            {uniqueSizes.length > 0 && (
              <SizeSelector 
                sizes={uniqueSizes} 
                selectedSize={selectedSize} 
                onSelect={setSelectedSize}
                recommendedSize="L"
              />
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-8">
            <button 
              onClick={handleAddToCart}
              className="flex-1 min-w-[140px] h-14 bg-white border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-[0.98]">
              <ShoppingBag size={20} />
              + Keranjang
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 min-w-[140px] h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-[0.98]">
              Beli Sekarang
            </button>
            <button 
              onClick={toggleWishlist}
              className="w-14 h-14 border border-gray-200 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
            >
              <Heart size={24} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Gratis Ongkir & Opsi Pick-up</h4>
              <p className="text-gray-600 text-sm mt-0.5">Nikmati pengiriman gratis ke seluruh Indonesia atau ambil langsung pesananmu di toko (O2O).</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 border-t border-gray-100">
            <details className="group py-4" open>
              <summary className="flex justify-between items-center font-semibold text-gray-900 cursor-pointer list-none">
                Deskripsi Produk
                <span className="transition group-open:rotate-180">
                  <ChevronRight size={20} className="text-gray-400 rotate-90" />
                </span>
              </summary>
              <div className="text-gray-600 text-sm leading-relaxed mt-4 pb-2">
                {product.deskripsi}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="space-y-2">
                    <li className="flex"><span className="w-32 font-medium text-gray-900">Bahan</span>: {product.bahanKain || "Premium Quality"}</li>
                    <li className="flex"><span className="w-32 font-medium text-gray-900">Gaya / Occasion</span>: {product.occasion || "Casual / Formal"}</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
