import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KoleksiCard from "@/components/beranda/KoleksiCard";

export const metadata = {
  title: "Koleksi Terpopuler | Irwa Fashion",
  description:
    "Jelajahi semua koleksi pakaian pria terpopuler dan tren terbaru di Irwa Fashion.",
};

export default async function KoleksiTerpopulerPage() {
  const koleksiTerpopuler = await prisma.koleksiTerpopuler.findMany({
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-primary/5 py-16 sm:py-24 relative overflow-hidden border-b border-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-primary/5 blur-3xl rounded-full transform rotate-12"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[100%] bg-blue-400/5 blur-3xl rounded-full transform -rotate-12"></div>
        </div>

        <div className="container-app relative z-10 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-white text-primary text-sm font-bold rounded-full uppercase tracking-widest shadow-sm mb-6 border border-primary/10">
            Koleksi Eksklusif
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Tren <span className="text-primary">Terpopuler</span> Saat Ini
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Jelajahi berbagai pilihan gaya dan koleksi pakaian pria terbaik kami
            yang sedang banyak diminati bulan ini.
          </p>
        </div>
      </div>

      <div className="container-app pt-8 relative z-20">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-primary/30"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        {koleksiTerpopuler.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Belum ada koleksi terpopuler
            </p>
            <p className="text-sm mt-1">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {koleksiTerpopuler.map((item) => (
              <KoleksiCard
                key={item.id}
                item={item}
                cardClassName="group flex flex-col rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
