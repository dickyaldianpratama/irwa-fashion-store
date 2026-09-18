import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingKoleksiTerpopuler() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Skeleton Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 py-16 sm:py-24 relative overflow-hidden">
        <div className="container-app relative z-10 flex flex-col items-center text-center">
          <div className="w-48 h-10 bg-gray-300 rounded-full animate-pulse mb-6"></div>
          <div className="w-64 sm:w-96 h-12 bg-gray-300 rounded-xl animate-pulse mb-4"></div>
          <div className="w-72 h-6 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="container-app py-10 -mt-8 relative z-20">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="block rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100">
              <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
