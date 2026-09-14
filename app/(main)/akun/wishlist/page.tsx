"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/akun/wishlist");
      if (res.ok) {
        const { data } = await res.json();
        setItems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      toast.error("Gagal memuat wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (produkId: string) => {
    // Optimistic UI update
    const previousItems = [...items];
    setItems((prev) => prev.filter((item) => item.produkId !== produkId));
    toast.success("Dihapus dari Wishlist");

    try {
      const res = await fetch(`/api/akun/wishlist?produkId=${produkId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
    } catch (error) {
      console.error(error);
      setItems(previousItems); // revert on error
      toast.error("Gagal menghapus item dari wishlist");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Memuat koleksi impianmu...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Heart className="text-rose-500" fill="currentColor" /> Wishlist Saya
        </h1>
        <p className="text-gray-500 text-sm">
          Simpan produk favoritmu di sini dan beli kapan saja kamu mau.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center py-24 px-4 shadow-sm">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={36} className="text-rose-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Wishlist Masih Kosong</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-8">
            Kamu belum menambahkan produk apapun ke daftar keinginan. Yuk, cari gaya terbaikmu sekarang!
          </p>
          <Link 
            href="/#belanja" 
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            Mulai Eksplorasi
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => {
            const product = item.produk;
            const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?q=80&w=600";
            
            // Mengambil harga dari produk (harga diskon jika ada, jika tidak harga asli)
            const displayPrice = product.hargaDiskon || product.hargaAsli || 0;

            return (
              <div 
                key={item.id} 
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col"
              >
                {/* Tombol Hapus - Absolute Top Right */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.produkId);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                  title="Hapus dari Wishlist"
                >
                  <Trash2 size={16} />
                </button>

                <Link href={`/produk/${product.slug}`} className="flex flex-col h-full">
                  {/* Gambar Produk */}
                  <div className="relative aspect-[4/5] bg-gray-50 w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.nama}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  {/* Info Produk */}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs font-semibold text-gray-400 mb-1 tracking-wider">{product.kategori?.nama || "KATEGORI"}</p>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.nama}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <p className="font-black text-gray-900">
                        Rp {displayPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </Link>
                
                {/* Tombol Add to Cart (Quick Add) */}
                <div className="p-4 pt-0">
                   <Link 
                    href={`/produk/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <ShoppingCart size={16} /> Lihat Produk
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

