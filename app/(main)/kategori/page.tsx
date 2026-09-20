import prisma from "@/lib/prisma";
import Link from "next/link";
import { LayoutGrid, ChevronRight } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Kategori | Irwa Fashion",
  description: "Jelajahi berbagai kategori produk di Irwa Fashion.",
};

export default async function KategoriPage() {
  const categories = await prisma.kategoriPilihan.findMany();

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 shadow-sm">
        <div className="container-app">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <LayoutGrid size={24} className="sm:w-6 sm:h-6 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Kategori Belanja
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                Jelajahi koleksi terbaik kami
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6 sm:py-8 animate-fade-in">
        {categories.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Belum ada kategori
            </p>
            <p className="text-sm mt-1">Kategori pilihan belum ditambahkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/produk?kategori=${cat.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.nama}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <LayoutGrid size={40} opacity={0.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/10 transition-colors duration-300" />
                </div>
                <div className="p-3 sm:p-4 flex items-center justify-between gap-2 flex-1">
                  <h2 className="font-semibold text-xs sm:text-sm text-gray-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {cat.nama}
                  </h2>
                  <div className="w-6 h-6 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
