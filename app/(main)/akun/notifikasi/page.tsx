import Link from "next/link";
import { Bell, ArrowLeft, CheckCircle2, Tag, Info } from "lucide-react";

export const metadata = {
  title: "Notifikasi Saya | Irwa Fashion",
  description: "Daftar notifikasi, promo, dan info pemesanan produk Anda.",
};

const notifikasiDummy = [
  {
    id: "1",
    title: "Selamat Datang di Irwa Fashion!",
    desc: "Nikmati penawaran spesial dan gratis ongkir untuk belanja produk pakaian pria pilihan.",
    time: "Baru saja",
    icon: Bell,
    type: "info",
  },
  {
    id: "2",
    title: "Promo Flash Sale & Shop The Look Active",
    desc: "Dapatkan paket outfit set hemat dan diskon spesial untuk koleksi terpopuler.",
    time: "1 hari yang lalu",
    icon: Tag,
    type: "promo",
  },
  {
    id: "3",
    title: "Sistem Pembayaran & Checkout Lancar",
    desc: "Seluruh metode pembayaran QRIS dan Transfer Bank aktif secara otomatis.",
    time: "2 hari yang lalu",
    icon: CheckCircle2,
    type: "system",
  },
];

export default function NotifikasiPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 shadow-xs">
        <div className="container-app max-w-3xl">
          <Link
            href="/akun"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Akun Saya
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Notifikasi Saya
                </h1>
                <p className="text-xs text-gray-500">Pemberitahuan, info promo, dan pemesanan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6 max-w-3xl space-y-3">
        {notifikasiDummy.map((notif) => {
          const IconComponent = notif.icon;
          return (
            <div
              key={notif.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-start gap-3.5 hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <IconComponent size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {notif.title}
                  </h2>
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {notif.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
