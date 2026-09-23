import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | Irwa Fashion",
  description: "Syarat dan ketentuan belanja di Irwa Fashion Store.",
};

export default function SyaratPage() {
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
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Syarat & Ketentuan
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Ketentuan layanan transaksi pembelian di Irwa Fashion Store.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p>
            Dengan melakukan transaksi di Irwa Fashion Store, Anda menyetujui syarat dan ketentuan layanan yang berlaku berikut ini:
          </p>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">1. Ketersediaan & Harga Produk</h2>
          <p>
            Harga produk dapat berubah sewaktu-waktu sesuai program diskon atau promosi aktif. Stok barang yang tertera diperbarui secara real-time di sistem toko.
          </p>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">2. Penukaran & Pengembalian Size</h2>
          <p>
            Penukaran ukuran diperbolehkan maksimal 3 hari setelah produk diterima dengan kondisi pakaian belum dipakai, tag label masih terpasang, dan tidak rusak/kotor.
          </p>
        </div>
      </div>
    </div>
  );
}
