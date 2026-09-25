"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bell
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch logged in user details
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAdminUser({
            email: user.email || "admin@irwa.com",
            name: user.user_metadata?.full_name || "Administrator"
          });
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };
    fetchUser();
  }, [supabase]);

  // Prevent background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.success("Berhasil keluar dari sesi admin.");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error logging out admin:", error);
      toast.error("Gagal keluar.");
    }
  };

  const navSections = [
    {
      group: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      group: "KATALOG & STOK",
      items: [
        { name: "Manajemen Produk", href: "/admin/produk/kategori", icon: PackageSearch },
      ]
    },
    {
      group: "TRANSAKSI & PELANGGAN",
      items: [
        { name: "Pesanan Masuk", href: "/admin/pesanan", icon: ShoppingCart },
        { name: "Data Pelanggan", href: "/admin/pelanggan", icon: Users },
      ]
    },
    {
      group: "PROMO & NOTIFIKASI",
      items: [
        { name: "Broadcast Notifikasi", href: "/admin/notifikasi", icon: Bell },
      ]
    }
  ];

  const SidebarInnerContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80 transition-colors select-none">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60">
        <Link 
          href="/admin" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 relative bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center p-1.5 shadow-xs border border-gray-200/80 dark:border-gray-700/80 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/images/irwa-logo.png"
              alt="Logo Toko IRWA"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight leading-none truncate">
                IRWA STORE
              </span>
            </div>
            <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
              <ShieldCheck size={12} className="shrink-0" />
              Admin Control Panel
            </span>
          </div>
        </Link>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Tutup Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto scrollbar-none">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {sec.group}
            </p>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                      isActive 
                        ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 shadow-2xs font-bold" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary-500 text-white shadow-xs" 
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-4 bg-primary-500 rounded-full animate-fade-in shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Link to Main Website */}
        <div className="pt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors border border-dashed border-gray-200 dark:border-gray-800"
          >
            <span className="flex items-center gap-2 truncate">
              <ExternalLink size={14} className="text-gray-400 shrink-0" />
              Lihat Toko Customer
            </span>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
          </a>
        </div>
      </nav>

      {/* Footer / Admin Account Card */}
      <div className="p-3.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Administrator Profile Card */}
        <div className="p-3 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {adminUser?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {adminUser?.email || "admin@irwa.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-xl transition-colors font-bold text-xs cursor-pointer"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Glass Header (Fixed at top for screens < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Buka Menu Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 relative bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <Image
                src="/images/irwa-logo.png"
                alt="Logo Toko IRWA"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
              IRWA Admin
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } md:static md:flex-shrink-0 h-screen`}
      >
        <SidebarInnerContent />
      </aside>
    </>
  );
}
