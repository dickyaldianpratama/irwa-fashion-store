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
  X
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // For mobile

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <div className="w-9 h-9 relative bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-sm">
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
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Utilities */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <div className="flex items-center gap-3">
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
        </button>
        
        {/* Back to Store */}
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <LogOut size={20} />
          Kembali ke Toko
        </Link>
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
