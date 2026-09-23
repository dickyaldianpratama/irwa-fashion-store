import Link from "next/link";
import { ArrowLeft, BookOpen, ShoppingBag, CreditCard, Truck } from "lucide-react";

export const metadata = {
  title: "Panduan Belanja | Irwa Fashion",
  description: "Petunjuk mudah cara berbelanja pakaian online di Irwa Fashion.",
};

export default function PanduanPage() {
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
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Panduan Belanja
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Langkah-langkah praktis memesan pakaian di Irwa Fashion Store.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">1</div>
          <div className="space-y-1">
            <h2 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" /> Pilih Produk & Ukuran
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Jelajahi katalog atau pilih outfit set pada menu Shop The Look / Koleksi Terpopuler. Pilih ukuran yang pas sesuai preferensi Anda.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">2</div>
          <div className="space-y-1">
            <h2 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <CreditCard size={16} className="text-indigo-600" /> Checkout & Isi Alamat
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Buka keranjang lalu klik Checkout. Isi alamat pengiriman dan pilih metode pembayaran resmi (QRIS, Transfer Bank, E-Wallet).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">3</div>
          <div className="space-y-1">
            <h2 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" /> Konfirmasi & Pengiriman
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Setelah pembayaran berhasil, tim kami akan mengemas dan mengirimkan barang ke alamat Anda dengan nomor resi terlacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
