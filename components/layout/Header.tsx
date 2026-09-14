"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  MapPin,
  HelpCircle,
  Phone,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

const kategoriNav = [
  { label: "Kemeja", href: "/kategori/kemeja" },
  { label: "Kaos", href: "/kategori/kaos" },
  { label: "Celana", href: "/kategori/celana" },
  { label: "Jaket", href: "/kategori/jaket" },
  { label: "Shop The Look", href: "/shop-the-look", badge: "New" },
  { label: "Flash Sale", href: "/promo", badge: "Hot" },
  { label: "Pre-Order", href: "/pre-order" },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ambil state dari Zustand (Cart, UI, Auth)
  const openCart = useUIStore((state) => state.openCart);
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const isLoggedInState = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = mounted ? totalCartItems : 0;
  const notifCount = 0;
  const isLoggedIn = mounted ? isLoggedInState : false;
  const isAdmin = mounted && user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-header">
      {/* ── Top Bar: Lokasi, FAQ, Kontak ── */}
      <div className="bg-primary-dark text-white/80 text-xs hidden md:block">
        <div className="container-app flex items-center justify-between py-1.5">
          <div className="flex items-center gap-4">
            <Link
              href="/lokasi"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MapPin size={12} />
              <span>Lokasi Toko</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <HelpCircle size={12} />
              <span>FAQ</span>
            </Link>
            <Link
              href="/kontak"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone size={12} />
              <span>Kontak</span>
            </Link>
          </div>
          <span className="text-white/60">
            Gratis ongkir min. belanja Rp 200.000 🎉
          </span>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="container-app py-3">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Lingkaran Logo - Dibuat penuh tanpa padding */}
              <div className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-white/20">
                <Image
                  src="/images/irwa-logo.png"
                  alt="Logo IRWA Fashion"
                  fill
                  sizes="44px"
                  priority
                  className="object-contain scale-[2]"
                />
              </div>
              
              {/* Teks Elegan Separuh Warna */}
              <div className="hidden sm:flex flex-col justify-center mt-0.5">
                <div className="font-heading text-[18px] leading-none tracking-widest uppercase drop-shadow-sm">
                  <span className="font-extrabold text-white">IRWA</span>
                  <span className="font-light text-promo ml-1.5">FASHION</span>
                </div>
                <span className="text-[9px] text-primary-light tracking-[0.45em] uppercase mt-1.5 font-medium ml-0.5 opacity-90">
                  House
                </span>
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            className="flex-1 min-w-0"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, kategori, bahan, atau lokasi..."
                className={cn(
                  "w-full pl-4 pr-12 py-2.5 rounded-pill",
                  "bg-white text-gray-800 text-sm placeholder:text-gray-400",
                  "border-0 outline-none",
                  "focus:ring-2 focus:ring-white/30 transition-all"
                )}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-primary-dark hover:bg-primary-dark/90 text-white rounded-r-pill transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Notifikasi */}
            <Link
              href="/akun/notifikasi"
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Notifikasi"
            >
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>

            {/* Akun */}
            {isLoggedIn ? (
              <Link
                href="/akun"
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Akun Saya"
              >
                <User size={20} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary text-xs font-semibold rounded-pill hover:bg-primary-light transition-colors"
              >
                <User size={14} />
                Masuk
              </Link>
            )}

            {/* Keranjang */}
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Keranjang"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Navbar Kategori (Desktop) ── */}
      <nav className="hidden md:block bg-primary border-t border-white/10">
        <div className="container-app">
          <ul className="flex items-center gap-1">
            <li className="flex items-center gap-1 text-white/70 text-sm py-2 pr-3 border-r border-white/20 mr-2">
              <span className="font-medium">Kategori</span>
              <ChevronDown size={14} />
            </li>
            {kategoriNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors font-medium"
                >
                  {item.label}
                  {item.badge && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white leading-none",
                        item.badge === "Hot" ? "bg-danger" : "bg-success"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="container-app py-4 space-y-1">
            {/* Link Utama */}
            {!isLoggedIn && (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-3 text-primary font-semibold border border-primary rounded-lg mb-3"
                onClick={() => setMobileOpen(false)}
              >
                <User size={16} />
                Masuk / Daftar
              </Link>
            )}

            {/* Info Links */}
            <div className="flex gap-3 pb-3 border-b border-gray-100">
              {[
                { href: "/lokasi", icon: MapPin, label: "Lokasi" },
                { href: "/faq", icon: HelpCircle, label: "FAQ" },
                { href: "/kontak", icon: Phone, label: "Kontak" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center gap-1 py-2 text-gray-600 hover:text-primary text-xs"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Kategori */}
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1 pt-2">
              Kategori
            </p>
            {kategoriNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:text-primary hover:bg-primary-light rounded-lg transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white",
                      item.badge === "Hot" ? "bg-danger" : "bg-success"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
