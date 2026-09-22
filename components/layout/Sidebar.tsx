"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User, Ruler, Package, Heart, Award, MapPin, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";

import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

const menuItems = [
  { name: "Dashboard", href: "/akun", icon: User },
  { name: "Ukuran Saya", href: "/akun/ukuran-saya", icon: Ruler },
  { name: "Pesanan Saya", href: "/akun/pesanan", icon: Package },
  { name: "Wishlist", href: "/akun/wishlist", icon: Heart },
  { name: "Poin & Reward", href: "/akun/poin", icon: Award },
  { name: "Alamat", href: "/akun/alamat", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    logout();
    useWishlistStore.getState().clearWishlist();
    useCartStore.getState().clearCart();
    toast.success("Berhasil keluar dari akun");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white md:rounded-2xl shadow-sm border-b md:border border-gray-100 md:overflow-hidden md:sticky md:top-24 mb-6 md:mb-0">
      <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-base md:text-lg shrink-0">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{user?.name || "Customer"}</h3>
          <p className="text-xs text-gray-500">Member Bronze</p>
        </div>
      </div>
      
      {/* Navigation Menu (Horizontal di Mobile, Vertikal di Desktop) */}
      <div className="p-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar gap-1 md:gap-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-row items-center gap-2 md:gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon size={18} />
              <span className="md:inline">{item.name}</span>
            </Link>
          );
        })}
        <hr className="hidden md:block my-2 border-gray-100" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 md:gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          <LogOut size={18} />
          <span className="md:inline">Keluar</span>
        </button>
      </div>
    </div>
  );
}
