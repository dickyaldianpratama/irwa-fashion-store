"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function AkunLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Proteksi Rute: Jika belum login, tendang ke halaman login
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Generate breadcrumb sederhana berdasarkan path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    // Format teks (contoh: "ukuran-saya" -> "Ukuran Saya")
    const label = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return { label, href };
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-4">
          <Breadcrumb items={[{ label: "Beranda", href: "/" }, ...breadcrumbItems]} />
        </div>
      </div>
      
      <div className="container-app py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-0 md:gap-8">
          {/* Sidebar Kiri */}
          <div className="w-full md:w-64 flex-shrink-0 -mx-4 md:mx-0 px-4 md:px-0">
            <Sidebar />
          </div>

          {/* Konten Kanan */}
          <div className="flex-1 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
