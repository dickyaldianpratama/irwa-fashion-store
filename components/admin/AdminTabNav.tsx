"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Star, Eye, Package } from "lucide-react";

const tabs = [
  { name: "Kategori Pilihan (Home)", href: "/admin/produk/kategori", icon: Grid3X3 },
  { name: "Kategori Pilihan (Produk)", href: "/admin/produk/kategori-pilihan-produk", icon: Package },
  { name: "Koleksi Terpopuler (Home)", href: "/admin/produk/featured", icon: Star },
  { name: "Shop The Look (Home)", href: "/admin/produk/shop-the-look", icon: Eye },
];

export default function AdminTabNav() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeTab = activeTabRef.current;
      
      const scrollLeft = activeTab.offsetLeft - (container.offsetWidth / 2) + (activeTab.offsetWidth / 2);
      
      setTimeout(() => {
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }, 50);
    }
  }, [pathname]);

  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-700">
      <div 
        ref={containerRef}
        className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={isActive ? activeTabRef : null}
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