"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User, Ruler, Package, Heart, Award, MapPin, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";

import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useSaveMySize } from "@/hooks/useSaveMySize";

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
  const { logout, user, login } = useAuthStore();
  const supabase = createClient();
  const [memberLevel, setMemberLevel] = useState<string>("BRONZE");
  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const [poinRes, profRes] = await Promise.all([
          fetch("/api/akun/poin", { cache: "no-store" }),
          fetch("/api/akun/profil", { cache: "no-store" }),
        ]);

        if (poinRes.ok) {
          const resData = await poinRes.json();
          if (resData?.data?.levelMember) {
            setMemberLevel(resData.data.levelMember);
          }
        }

        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData?.data?.name) {
            setProfileName(profData.data.name);
            if (user && user.name !== profData.data.name) {
              login({ ...user, name: profData.data.name });
            }
          }
          if (profData?.data?.email) {
            setProfileEmail(profData.data.email);
          }
        }
      } catch (e) {}
    };
    fetchMemberData();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    logout();
    useWishlistStore.getState().clearWishlist();
    useCartStore.getState().clearCart();
    useSaveMySize.getState().resetProfile();
    toast.success("Berhasil keluar dari akun");
    window.location.href = "/login";
  };

  const formattedLevel =
    memberLevel.charAt(0).toUpperCase() + memberLevel.slice(1).toLowerCase();

  const displayName = user?.name || profileName || "Customer";
  const displayEmail = user?.email || profileEmail || "";

  return (
    <div className="bg-white md:rounded-2xl shadow-sm border-b md:border border-gray-100 md:overflow-hidden md:sticky md:top-24 mb-6 md:mb-0">
      <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-base md:text-lg shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">
            {displayName}
          </h3>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-500">
            Member {formattedLevel}
          </p>
          {displayEmail && (
            <p className="text-[11px] text-gray-500 truncate font-mono mt-0.5" title={displayEmail}>
              {displayEmail}
            </p>
          )}
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
