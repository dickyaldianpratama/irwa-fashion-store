"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  if (!isMounted)
    return <div className="min-h-screen bg-gray-50 animate-pulse" />;

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="container-app">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={24} className="text-primary" />
              Keranjang Belanja
            </h1>
          </div>
        </div>
        <div className="container-app py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Keranjang Kosong
          </h2>
          <p className="text-gray-500 mb-6">
            Yuk, mulai belanja produk terbaik kami!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container-app">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={24} className="text-primary" />
            Keranjang Belanja
            <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </h1>
        </div>
      </div>

      <div className="container-app py-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img
                src={item.gambar}
                alt={item.nama}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {item.nama}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {item.ukuran !== "-" && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">
                    {item.ukuran}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-black text-primary text-base">
                  {formatRupiah(item.harga * item.jumlah)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.jumlah - 1)}
                    disabled={item.jumlah <= 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">
                    {item.jumlah}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.jumlah + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
        <div className="container-app py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 font-medium">
              Subtotal ({items.length} produk)
            </span>
            <span className="text-lg font-black text-gray-900">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full h-13 py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all active:scale-[0.98]"
          >
            Lanjut ke Checkout <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
