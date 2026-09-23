import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Heart } from "lucide-react";

export const metadata = {
  title: "Tentang Kami | Irwa Fashion",
  description: "Profil dan kisah di balik brand Irwa Fashion House.",
};

export default function TentangPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Tentang Irwa Fashion House
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            House of Premium Men&apos;s Fashion & Quality Apparel
          </p>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Filosofi & Kualitas
          </h2>
          <p>
            Irwa Fashion House hadir dengan komitmen menghadirkan koleksi pakaian pria modern berdesain elegan, nyaman, dan menggunakan material kain pilihan terbaik.
          </p>
          <p>
            Setiap potongan kemeja, kaos, celana, hingga outfit set dirancang secara teliti demi mendukung kepercayaan diri dalam berbagai aktivitas sehari-hari maupun acara formal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <ShieldCheck size={20} className="text-primary" />
              <h3 className="font-bold text-gray-900">Garansi Kualitas</h3>
              <p className="text-xs text-gray-500">Material kain pilihan melalui proses Quality Control ketat.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <Heart size={20} className="text-rose-500" />
              <h3 className="font-bold text-gray-900">Kepuasan Pelanggan</h3>
              <p className="text-xs text-gray-500">Layanan ramah, respon cepat, dan fasilitas tukar ukuran.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
