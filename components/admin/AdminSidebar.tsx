"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  UserCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const supabase = createClient();
  const { logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // Fetch logged in user details
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser({
          email: user.email,
          name: user.user_metadata?.full_name || "Administrator"
        });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout(); // clear zustand store
      toast.success("Berhasil keluar dari sesi admin.");
      // Redirect with hard reload to run server-side checks and show login form
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal keluar.");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Produk", href: "/admin/produk", icon: PackageSearch },
    { name: "Pesanan", href: "/admin/pesanan", icon: ShoppingCart },
    { name: "Pelanggan", href: "/admin/pelanggan", icon: Users },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors">
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 relative bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-500/20 shadow-sm">
            <Image
              src="/images/irwa-logo.png"
              alt="Logo Toko"
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
            Admin Panel
          </span>
        </Link>
        <button className="md:hidden text-gray-500 dark:text-gray-400" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Utilities & Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        
        {/* Admin Profile Card */}
        {adminUser && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                <UserCircle size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{adminUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{adminUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 rounded-lg transition-colors font-medium text-sm"
            >
              <LogOut size={16} />
              Keluar (Logout)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white dark:bg-gray-900 shadow-md rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-[50] w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex-shrink-0`}>
        <SidebarContent />
      </aside>
    </>
  );
}
