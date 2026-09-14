"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // Menghindari Hydration mismatch karena Zustand state di persist ke LocalStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay Hitam */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm",
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={closeCart}
      />

      {/* Panel Keranjang */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header Keranjang */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Keranjang Belanja</h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Isi Keranjang */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Keranjang masih kosong</h3>
                <p className="text-sm text-gray-500 mt-1">Yuk, temukan pakaian favoritmu!</p>
              </div>
              <Link
                href="/#belanja"
                onClick={closeCart}
                className="inline-block px-6 py-2 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary/20 transition-colors mt-2"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    <Image 
                      src={item.gambar || "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400"} 
                      alt={item.nama || "Product Image"} 
                      fill 
                      className="object-cover" 
                      sizes="80px" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{item.nama}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1.5 -mt-1 -mr-1 rounded-md hover:bg-red-50 shrink-0"
                          title="Hapus produk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        <span>Warna: {item.warna}</span>
                        <span className="w-px h-3 bg-gray-300"></span>
                        <span>Ukuran: <b className="text-gray-700">{item.ukuran}</b></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">{formatRupiah(item.harga)}</span>
                      
                      {/* Kontrol Jumlah */}
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-gray-500"
                          onClick={() => item.jumlah > 1 && updateQuantity(item.id, item.jumlah - 1)}
                          disabled={item.jumlah <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.jumlah}</span>
                        <button
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                          onClick={() => updateQuantity(item.id, item.jumlah + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Total Belanja</span>
              <span className="text-xl font-bold text-gray-900">{formatRupiah(getTotalPrice())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-4 px-6 bg-primary text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
            >
              Lanjut ke Checkout
              <ChevronRightIcon />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
