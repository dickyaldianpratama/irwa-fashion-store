"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Grid3X3, Star, Eye, Tags } from "lucide-react";

const tabs = [
  { name: "Semua Produk", href: "/admin/produk", icon: Package },
  { name: "Kategori Pilihan (Home)", href: "/admin/produk/kategori", icon: Grid3X3 },
  { name: "Koleksi Terpopuler (Home)", href: "/admin/produk/featured", icon: Star },
  { name: "Shop The Look (Home)", href: "/admin/produk/shop-the-look", icon: Eye },
];

export default function AdminTabNav() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/admin/produk"
              ? pathname === "/admin/produk" || pathname === "/admin/produk/tambah" || pathname.match(/^\/admin\/produk\/[^\/]+\/edit$/)
              : pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300"
              }`}
            >
              <Icon size={16} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}