"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { openCart } = useUIStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hitung total kuantitas barang
  const totalItems = items.reduce((total, item) => total + item.jumlah, 0);
  const totalWishlistItems = useWishlistStore((state) => state.items.length);
  const wishlistCount = isMounted ? totalWishlistItems : 0;

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Kategori", href: "/kategori", icon: LayoutGrid },
    { name: "Wishlist", href: "/akun/wishlist", icon: Heart },
    { name: "Akun", href: "/akun", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <Link 
          href="/"
          className={cn("flex flex-col items-center justify-center w-full gap-1 transition-colors", pathname === "/" ? "text-primary" : "text-gray-400")}
        >
          <Home size={22} className={cn(pathname === "/" && "fill-primary/10")} />
          <span className={cn("text-[10px] font-medium", pathname === "/" && "font-bold")}>Beranda</span>
        </Link>
        
        <Link 
          href="/kategori"
          className={cn("flex flex-col items-center justify-center w-full gap-1 transition-colors", pathname.startsWith("/kategori") ? "text-primary" : "text-gray-400")}
        >
          <LayoutGrid size={22} className={cn(pathname.startsWith("/kategori") && "fill-primary/10")} />
          <span className={cn("text-[10px] font-medium", pathname.startsWith("/kategori") && "font-bold")}>Kategori</span>
        </Link>

        <div className="flex flex-col items-center justify-center w-full relative">
          <button 
            onClick={openCart}
            className="absolute -top-7 bg-primary text-white p-3.5 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          >
            <ShoppingBag size={22} />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </button>
          <span className="text-[10px] text-gray-500 font-medium mt-7">Keranjang</span>
        </div>

        <Link 
          href="/akun/wishlist"
          className={cn("flex flex-col items-center justify-center w-full gap-1 transition-colors", pathname.startsWith("/akun/wishlist") ? "text-primary" : "text-gray-400")}
        >
          <div className="relative">
            <Heart size={22} className={cn(pathname.startsWith("/akun/wishlist") && "fill-primary/10")} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </div>
          <span className={cn("text-[10px] font-medium", pathname.startsWith("/akun/wishlist") && "font-bold")}>Wishlist</span>
        </Link>

        <Link 
          href={isMounted && isLoggedIn ? "/akun" : "/login"}
          className={cn("flex flex-col items-center justify-center w-full gap-1 transition-colors", pathname.startsWith("/akun") || pathname === "/login" ? "text-primary" : "text-gray-400")}
        >
          <User size={22} className={cn((pathname.startsWith("/akun") || pathname === "/login") && "fill-primary/10")} />
          <span className={cn("text-[10px] font-medium", (pathname.startsWith("/akun") || pathname === "/login") && "font-bold")}>Akun</span>
        </Link>
      </div>
    </div>
  );
}
