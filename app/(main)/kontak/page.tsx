import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowLeft, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Kontak Kami | Irwa Fashion",
  description: "Hubungi tim customer service Irwa Fashion House untuk pertanyaan atau bantuan pemesanan.",
};

export default function KontakPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Hubungi Kontak Kami
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ada pertanyaan atau butuh bantuan? Kami siap melayani Anda.
          </p>
        </div>
      </div>

      <div className="container-app py-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Saluran Komunikasi</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Hubungi kami melalui berbagai saluran komunikasi resmi di bawah ini:
          </p>

          <div className="space-y-3 pt-2 text-xs sm:text-sm">
            <a
              href="https://wa.me/6283199116298"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle size={20} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">WhatsApp Respon Cepat</span>
                <span className="text-xs">0831-9911-6298 (24 Jam Chat Active)</span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
              <Mail size={20} className="text-primary shrink-0" />
              <div>
                <span className="font-bold block text-gray-900">Email Customer Support</span>
                <span className="text-xs text-gray-500">bgdicky123@gmail.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
              <Phone size={20} className="text-primary shrink-0" />
              <div>
                <span className="font-bold block text-gray-900">Hotline Telepon</span>
                <span className="text-xs text-gray-500">083199116298</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
              <Clock size={20} className="text-primary shrink-0" />
              <div>
                <span className="font-bold block text-gray-900">Jam Operasional Service</span>
                <span className="text-xs text-gray-500">Senin - Minggu (08:00 - 21:00 WIB)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Alamat Outlet Fisik</h2>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="block text-gray-900">Irwa Fashion Store</strong>
                <span>Jalan Harapan Jaya No 17 B, Labu Baru Barat, Kecamatan Payung sekaki, Pekanbaru, Riau</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/lokasi"
              className="w-full btn btn-primary text-xs py-3 rounded-xl justify-center font-bold"
            >
              Lihat Peta & Detail Lokasi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
