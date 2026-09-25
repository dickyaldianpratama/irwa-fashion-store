"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Loader2,
  Users,
  Smartphone,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Monitor,
  Laptop,
  User,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface Subscriber {
  id: string;
  token: string;
  userId: string | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
}

export default function AdminNotifikasiPage() {
  const [title, setTitle] = useState("🎉 Flash Sale Diskon 50% Irwa Fashion!");
  const [body, setBody] = useState(
    "Dapatkan koleksi kemeja & kaos pria impianmu dengan harga hemat hari ini. Klik untuk belanja sekarang!"
  );
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800"
  );
  const [url, setUrl] = useState("/promo");
  const [sending, setSending] = useState(false);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Fetch subscribers data
  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/admin/notifikasi/broadcast");
      const data = await res.json();
      setTotalSubscribers(data.totalSubscribers || 0);
      setSubscribers(data.subscribers || []);
    } catch {
      setTotalSubscribers(0);
      setSubscribers([]);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast.error("Judul dan isi pesan wajib diisi");
      return;
    }

    const confirm = await MySwal.fire({
      title: "Kirim Broadcast Notifikasi?",
      text: `Pesan promo akan dikirim langsung ke ${totalSubscribers} perangkat pelanggan terdaftar.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim Sekarang!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifikasi/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          url: url.trim() || "/promo",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim notifikasi");
      }

      await MySwal.fire({
        title: "Broadcast Terkirim! 🎉",
        text: data.message || `Notifikasi berhasil disiarkan!`,
        icon: "success",
        confirmButtonColor: "#2563EB",
      });

      fetchSubscribers();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim notifikasi");
    } finally {
      setSending(false);
    }
  };

  const getDeviceIcon = (deviceInfo?: string | null) => {
    if (!deviceInfo) return <Smartphone size={15} className="text-blue-500" />;
    const info = deviceInfo.toLowerCase();
    if (info.includes("android") || info.includes("ios") || info.includes("iphone")) {
      return <Smartphone size={15} className="text-blue-500" />;
    }
    if (info.includes("windows") || info.includes("mac") || info.includes("desktop")) {
      return <Laptop size={15} className="text-indigo-500" />;
    }
    return <Monitor size={15} className="text-gray-500" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="text-primary w-7 h-7" /> Broadcast Notifikasi Promo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kirim notifikasi melayang ke layar HP & Komputer pelanggan secara langsung via Firebase.
          </p>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Pelanggan Terdaftar
            </p>
            <h3 className="text-2xl font-black mt-1">
              {loadingSubscribers ? "..." : `${totalSubscribers} Perangkat`}
            </h3>
            <p className="text-[11px] text-blue-200 mt-1">
              Siap menerima notifikasi melayang
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Layanan Push
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Firebase Cloud Messaging
            </h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Status Aktif
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Jangkauan Notifikasi
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              PWA & Mobile Browser
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              Android, Windows, iOS, macOS
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Send size={24} />
          </div>
        </div>
      </div>

      {/* Broadcast Form & Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Broadcast */}
        <form
          onSubmit={handleSendBroadcast}
          className="lg:col-span-7 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-5"
        >
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Buat Pesan Notifikasi Baru
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Isi formulir di bawah ini untuk menyiarkan pesan promo ke seluruh perangkat pelanggan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Judul Notifikasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 🎉 Flash Sale Diskon 50% Irwa Fashion!"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Isi Pesan Promo <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Contoh: Dapatkan koleksi kemeja & kaos pria impianmu dengan harga hemat hari ini. Klik untuk belanja sekarang!"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              URL Gambar Banner Promo (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <ImageIcon size={16} />
              </div>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Link Tujuan Saat Notifikasi Diklik
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/promo atau /kategori/kemeja"
                className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["/promo", "/kategori/kemeja", "/koleksi-terpopuler", "/produk", "/"].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUrl(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      url === preset
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 px-5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Menyiarkan ke Pelanggan...
                </>
              ) : (
                <>
                  <Send size={18} /> Kirim Broadcast Notifikasi Sekarang
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Device Preview */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone size={16} className="text-primary" /> Preview Notifikasi di Perangkat Customer
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tampilan notifikasi yang akan muncul di layar HP/PC pelanggan — clean &amp; elegan.
            </p>
          </div>

          {/* Desktop Preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-0.5">Desktop / Tablet</p>
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              {/* Notification card - desktop style (top-right) */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
                style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(26,159,212,0.15), 0 0 0 1px rgba(26,159,212,0.1)" }}>
                {/* Accent bar */}
                <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #1A9FD4 0%, #45B5E3 100%)" }} />
                <div className="p-3.5">
                  <div className="flex items-start gap-3">
                    {/* Brand icon */}
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #1A9FD4 0%, #106B93 100%)", boxShadow: "0 2px 8px rgba(26,159,212,0.3)" }}>
                      <span className="text-white font-extrabold text-[12px] tracking-wide font-heading">IR</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Irwa Fashion</span>
                        <span className="text-[10px] text-gray-400">Baru saja</span>
                      </div>
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {title || "Judul Notifikasi"}
                      </p>
                      {body && (
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {body}
                        </p>
                      )}
                    </div>
                    {/* Close dot */}
                    <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-[-2px]">
                      <span className="text-gray-400 text-[11px] font-bold">×</span>
                    </div>
                  </div>
                  {image && (
                    <div className="mt-3 w-full h-24 rounded-[10px] overflow-hidden bg-gray-100">
                      <img src={image} alt="Preview" className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = "none")} />
                    </div>
                  )}
                  {url && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Ketuk untuk melihat penawaran</span>
                      <span className="text-[11px] font-bold text-primary">Lihat →</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-0.5">Mobile / HP</p>
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mb-3 px-0.5">
                <span>9:41</span>
                <span className="font-bold">Irwa Fashion Store</span>
              </div>
              {/* Mobile notification banner style */}
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(26,159,212,0.08)" }}>
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #1A9FD4 0%, #45B5E3 100%)" }} />
                <div className="px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #1A9FD4 0%, #106B93 100%)" }}>
                    <span className="text-white font-extrabold text-[10px] font-heading">IR</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Irwa Fashion</span>
                      <span className="text-[9px] text-gray-400">Skrg</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                      {title || "Judul Notifikasi"}
                    </p>
                    {body && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 leading-tight">
                        {body}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Devices Table */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-primary" /> Daftar Perangkat & Pelanggan Terdaftar
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Perangkat pelanggan yang telah menyetujui izin notifikasi dan siap menerima broadcast.
            </p>
          </div>
          <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
            Total {totalSubscribers} Perangkat
          </span>
        </div>

        {loadingSubscribers ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Memuat daftar perangkat...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Belum ada perangkat terdaftar
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Perangkat akan otomatis terdaftar ketika pelanggan mengizinkan notifikasi di toko.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Pelanggan / Pengunjung</th>
                  <th className="py-3 px-4">Perangkat & Browser</th>
                  <th className="py-3 px-4">Alamat IP</th>
                  <th className="py-3 px-4">Terakhir Aktif</th>
                  <th className="py-3 px-4 text-right">Status Notifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {subscribers.map((sub) => {
                  const userName = sub.user?.name || "Pengunjung Tamu (Guest)";
                  const userEmail = sub.user?.email || "Belum Login Akun";
                  const dateStr = new Date(sub.updatedAt || sub.createdAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {sub.user?.avatar ? (
                              <img
                                src={sub.user.avatar}
                                alt={userName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : sub.user?.name ? (
                              sub.user.name.charAt(0).toUpperCase()
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                              {userName}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                            {getDeviceIcon(sub.deviceInfo)}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {sub.deviceInfo || "Perangkat Web"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                        {sub.ipAddress || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={11} /> Siap Menerima
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
