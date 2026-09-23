import Link from "next/link";
import { HelpCircle, ArrowLeft, ChevronDown, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "FAQ & Tanya Jawab | Irwa Fashion",
  description: "Pertanyaan yang sering diajukan seputar pemesanan, pengiriman, dan produk di Irwa Fashion.",
};

const faqs = [
  {
    q: "Bagaimana cara melakukan pemesanan di Irwa Fashion?",
    a: "Pilih produk yang Anda inginkan, tentukan ukuran & warna, lalu klik 'Beli Sekarang' atau 'Tambah ke Keranjang'. Selanjutnya buka halaman Checkout untuk mengisi alamat dan memilih metode pembayaran.",
  },
  {
    q: "Berapa lama proses pengiriman pesanan?",
    a: "Pengiriman diproses 1-2 hari kerja setelah pembayaran terkonfirmasi. Estimasi pengiriman reguler adalah 2-4 hari kerja tergantung lokasi Anda.",
  },
  {
    q: "Apakah produk di Irwa Fashion 100% Original?",
    a: "Ya! Seluruh produk dibuat dengan bahan kain premium dan melewati proses Quality Control (QC) ketat untuk menjamin kualitas terbaik.",
  },
  {
    q: "Bagaimana jika ukuran baju yang dibeli kurang pas?",
    a: "Kami menyediakan garansi tukar ukuran. Anda dapat menghubungi customer service via WhatsApp untuk memandu proses pengembalian/penukaran size.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami mendukung berbagai metode pembayaran aman termasuk QRIS, Transfer Bank (BCA, Mandiri, BRI, BNI), Virtual Account, dan E-Wallet melalui payment gateway terpercaya Midtrans.",
  },
];

export default function FAQPage() {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <HelpCircle size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                FAQ (Pertanyaan Populer)
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Temukan jawaban cepat mengenai pemesanan, pengiriman, dan layanan Irwa Fashion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden transition-all"
            open={idx === 0}
          >
            <summary className="flex items-center justify-between p-4 sm:p-5 font-bold text-sm sm:text-base text-gray-900 cursor-pointer select-none">
              <span>{faq.q}</span>
              <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
              {faq.a}
            </div>
          </details>
        ))}

        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-xs text-center space-y-3">
          <ShieldCheck size={32} className="mx-auto text-primary" />
          <h3 className="font-bold text-base text-gray-900">Masih Ada Pertanyaan Lain?</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Tim Customer Service kami siap membantu Anda menjawab pertanyaan lebih lanjut secara ramah dan cepat.
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20IRWA,%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn btn-primary text-xs px-5 py-2.5 rounded-xl font-bold"
          >
            <MessageCircle size={15} /> Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
