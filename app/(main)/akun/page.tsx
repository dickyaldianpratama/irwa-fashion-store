"use client";

import { useAuthStore } from "@/store/authStore";
import { useSaveMySize } from "@/hooks/useSaveMySize";
import { Package, Heart, Award, Ruler, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { useWishlistStore } from "@/store/wishlistStore";

export default function AkunDashboard() {
  const { user } = useAuthStore();
  const { hasProfile } = useSaveMySize();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Poin Loyalti", value: "150", icon: Award, href: "/akun/poin", color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Pesanan Aktif", value: "0", icon: Package, href: "/akun/pesanan", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Wishlist", value: mounted ? wishlistCount.toString() : "0", icon: Heart, href: "/akun/wishlist", color: "text-red-500", bg: "bg-red-50" },
    { label: "Profil Ukuran", value: mounted && hasProfile ? "Tersimpan" : "Belum", icon: Ruler, href: "/akun/ukuran-saya", color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.name || "Customer"}!</h1>
          <p className="text-gray-500 mt-1 text-sm">Kelola pesanan, ukuran tubuh, dan preferensi akun Anda di sini.</p>
        </div>
        <Link 
          href="/akun/profil" 
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Edit Profil
        </Link>
      </div>

      {/* Grid Statistik Pendek */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
          </Link>
        ))}
      </div>

      {/* Banner Save My Size (Inovasi PRD) */}
      {mounted && !hasProfile && (
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Ruler size={20} className="text-yellow-300" />
              <h3 className="text-lg font-bold">Lengkapi Profil Ukuran Anda!</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg">
              Dapatkan rekomendasi ukuran otomatis ("Cocok: L") di setiap produk. Tidak perlu bingung lagi memilih size kemeja atau celana.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <Link href="/akun/ukuran-saya" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-bold hover:bg-gray-50 transition-colors whitespace-nowrap">
              Isi Save My Size <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Pesanan Terakhir */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Pesanan Terakhir</h2>
          <Link href="/akun/pesanan" className="text-sm font-semibold text-primary hover:text-primary-dark">Lihat Semua</Link>
        </div>
        <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-gray-100 border-dashed">
          <Package size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada pesanan yang sedang aktif.</p>
          <Link href="/#belanja" className="mt-4 px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Mulai Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}

