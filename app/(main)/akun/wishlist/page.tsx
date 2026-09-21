"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useWishlistStore, WishlistItem } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Sync with server if logged in
    fetch("/api/akun/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data)) {
          const addStoreItem = useWishlistStore.getState().addItem;
          resData.data.forEach((w: any) => {
            if (w.produk) {
              const p = w.produk;
              const imgUrl = p.images?.[0]?.url || "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?q=80&w=600";
              addStoreItem({
                id: p.id,
                type: "produk",
                nama: p.nama,
                link: `/produk/${p.slug}`,
                harga: p.hargaDiskon || p.hargaAsli || 0,
                hargaAsli: p.hargaAsli,
                gambar: imgUrl,
                kategori: p.kategori?.nama || "Pakaian",
                stok: 10,
              });
            }
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleRemove = (id: string) => {
    removeItem(id);
    toast.success("Dihapus dari Wishlist");
    // Sync delete to server if logged in
    fetch(`/api/akun/wishlist?produkId=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      productId: item.id,
      nama: item.nama,
      harga: item.harga,
      gambar: item.gambar,
      ukuran: item.ukuranDefault || "-",
      warna: item.warnaDefault || "-",
      jumlah: 1,
    });
    toast.success("Berhasil ditambahkan ke keranjang!");
    openCart();
  };

  if (!isMounted) {
    return (
      <div className="py-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
        <div className="h-4 w-36 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-16">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" size={24} />
              Wishlist Saya
              <span className="text-xs bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded-full border border-red-100">
                {items.length} item
              </span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Simpan pakaian dan koleksi impianmu di sini untuk dibeli kapan saja.
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-gray-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-center py-20 px-4 shadow-xs">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <Heart size={36} className="text-red-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
            Wishlist Masih Kosong
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm mb-6">
            Kamu belum menandai produk atau koleksi favorit. Yuk, cari pakaian pria terbaikmu sekarang!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              Mulai Eksplorasi <ArrowRight size={16} />
            </Link>
            <Link
              href="/koleksi-terpopuler"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={16} className="text-amber-500" /> Koleksi Terpopuler
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((item) => {
            const isDiscounted =
              !!item.hargaAsli && item.hargaAsli > item.harga;

            return (
              <div
                key={item.id}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 relative flex flex-col"
              >
                {/* Tombol Hapus */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="absolute top-2.5 right-2.5 z-20 w-8 h-8 bg-white/90 backdrop-blur-xs rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                  title="Hapus dari Wishlist"
                  aria-label="Hapus dari Wishlist"
                >
                  <Trash2 size={15} />
                </button>

                {/* Badge Tipe / Kategori */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {item.type === "koleksi" ? (
                    <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold rounded-md bg-gradient-to-r from-primary-500 to-sky-500 text-white shadow-xs tracking-wider uppercase">
                      Koleksi
                    </span>
                  ) : item.kategori ? (
                    <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md bg-white/90 backdrop-blur-xs text-gray-700 border border-gray-100 shadow-xs">
                      {item.kategori}
                    </span>
                  ) : null}
                </div>

                {/* Card Thumbnail & Info */}
                <Link href={item.link} className="flex flex-col flex-1">
                  <div className="relative aspect-square sm:aspect-[4/5] bg-gray-50 w-full overflow-hidden">
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.nama}
                    </h3>

                    <div className="mt-auto pt-2.5">
                      {isDiscounted && (
                        <span className="text-[10px] sm:text-[11px] text-gray-400 line-through block">
                          Rp {item.hargaAsli?.toLocaleString("id-ID")}
                        </span>
                      )}
                      <p className="font-black text-gray-900 text-sm sm:text-base">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="p-3 pt-0 flex gap-1.5">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 py-2 sm:py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 active:scale-[0.98] cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>+ Keranjang</span>
                  </button>
                  <Link
                    href={item.link}
                    className="px-2.5 py-2 sm:py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0"
                    title="Lihat Detail"
                  >
                    <ArrowRight size={14} />
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
