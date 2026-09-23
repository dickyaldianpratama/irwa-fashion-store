import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | Irwa Fashion",
  description: "Kebijakan perlindungan data dan privasi pengguna di Irwa Fashion Store.",
};

export default function PrivasiPage() {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Kebijakan Privasi
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Perlindungan data dan informasi pribadi Anda adalah prioritas utama kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p>
            Irwa Fashion Store berkomitmen untuk menjamin kerahasiaan dan keamanan data pribadi yang Anda berikan saat berbelanja atau menggunakan layanan kami.
          </p>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Pengumpulan Data</h2>
          <p>
            Data yang kami kumpulkan meliputi nama, nomor telepon, alamat email, dan alamat pengiriman yang digunakan semata-mata untuk memproses transaksi dan pengiriman pesanan Anda.
          </p>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Keamanan Pembayaran</h2>
          <p>
            Seluruh transaksi pembayaran diproses melalui gerbang pembayaran terenkripsi (payment gateway) terverifikasi. Kami tidak menyimpan detail kartu kredit atau kredensial perbankan Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
