import Link from "next/link";
import { ArrowLeft, RefreshCw, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Garansi Tukar Ukuran | Irwa Fashion",
  description: "Layanan garansi dan panduan tukar ukuran pakaian di Irwa Fashion Store.",
};

export default function TukarUkuranPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app max-w-3xl">
          <Link
            href="/akun"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Akun Saya
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <RefreshCw size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Garansi Tukar Ukuran (Size Exchange)
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Baju kurang pas? Kami bantu tukar size dengan mudah.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <ShieldCheck size={20} /> 100% Fit Guarantee
          </div>
          <p>
            Di Irwa Fashion, kami ingin memastikan pakaian yang Anda beli benar-benar pas dan nyaman dipakai. Jika ukuran baju yang Anda terima kekecilan atau kebesaran, Anda berhak mengajukan **Tukar Ukuran**.
          </p>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">Syarat Mudah Tukar Size:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs sm:text-sm">
              <li>Konfirmasi maksimal 3 hari setelah barang diterima.</li>
              <li>Pakaian belum pernah dicuci/dipakai dan hangtag masih utuh.</li>
              <li>Stok ukuran pengganti masih tersedia.</li>
            </ul>
          </div>

          <div className="pt-2 text-center">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20IRWA,%20saya%20ingin%20mengajukan%20tukar%20ukuran%20baju"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn btn-primary text-xs px-6 py-3 rounded-xl font-bold"
            >
              <MessageCircle size={16} /> Ajukan Tukar Size via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
