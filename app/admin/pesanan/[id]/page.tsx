"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Loader2,
  Copy,
  Check,
  Store,
  User,
  CreditCard,
  Package,
  AlertCircle,
  Save,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resiInput, setResiInput] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [isSavingResi, setIsSavingResi] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pesanan/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat pesanan");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
          setResiInput(data.data.resiKurir || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("ID Pesanan berhasil disalin!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const updateStatus = async (newStatus: string, customResi?: string) => {
    setIsUpdating(true);
    try {
      const payload: any = { status: newStatus };
      if (customResi !== undefined) {
        payload.resiKurir = customResi;
      }

      const res = await fetch(`/api/admin/pesanan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update status");

      setOrder((prev: any) => ({
        ...prev,
        status: newStatus,
        statusPesanan: newStatus,
        ...(customResi !== undefined ? { resiKurir: customResi } : {}),
      }));

      const statusLabels: Record<string, string> = {
        PAID: "Sudah Dibayar",
        PROCESSING: "Diproses",
        SHIPPED: "Sedang Dikirim",
        READY_FOR_PICKUP: "Siap Diambil",
        DELIVERED: "Selesai",
        CANCELLED: "Dibatalkan",
      };

      toast.success(
        `Status berhasil diubah ke: ${statusLabels[newStatus] || newStatus}`
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveResiOnly = async () => {
    setIsSavingResi(true);
    try {
      const res = await fetch(`/api/admin/pesanan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resiKurir: resiInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan nomor resi");

      setOrder((prev: any) => ({
        ...prev,
        resiKurir: resiInput.trim(),
      }));

      toast.success("Nomor resi kurir berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSavingResi(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-gray-500">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-16 text-center space-y-4">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Pesanan Tidak Ditemukan
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          ID pesanan tidak ada di database atau telah dihapus.
        </p>
        <Link
          href="/admin/pesanan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const currentStatus = order.statusPesanan || order.status;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pesanan"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={22} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-mono uppercase">
                #{order.id.split("-")[0]}
              </h1>
              <button
                onClick={handleCopyId}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
                title="Salin ID Lengkap"
              >
                {copiedId ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {order.tanggal} pukul {order.waktu}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              currentStatus === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : currentStatus === "SHIPPED"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : currentStatus === "READY_FOR_PICKUP"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                : currentStatus === "PROCESSING"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : currentStatus === "PAID"
                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                : currentStatus === "CANCELLED"
                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
            }`}
          >
            {currentStatus === "DELIVERED"
              ? "Selesai"
              : currentStatus === "SHIPPED"
              ? "Sedang Dikirim"
              : currentStatus === "READY_FOR_PICKUP"
              ? "Siap Diambil"
              : currentStatus === "PROCESSING"
              ? "Sedang Diproses"
              : currentStatus === "PAID"
              ? "Sudah Dibayar"
              : currentStatus === "CANCELLED"
              ? "Dibatalkan"
              : "Menunggu Pembayaran"}
          </span>

          <Link
            href={`/invoice/${order.id}`}
            target="_blank"
            className="px-3.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Lihat Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri / Utama: Items & Pengiriman */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daftar Barang */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Daftar Barang ({order.items.length} varian)
            </h2>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {item.nama}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {[
                        item.warna && item.warna !== "-" ? item.warna : null,
                        item.ukuran && item.ukuran !== "-"
                          ? `Size ${item.ukuran}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                      {item.qty} x Rp {item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-gray-900 dark:text-white">
                      Rp {(item.harga * item.qty).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Pengiriman / Pickup */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              {order.tipePengiriman === "PICKUP" ? (
                <Store size={18} className="text-purple-600" />
              ) : (
                <Truck size={18} className="text-blue-600" />
              )}
              {order.tipePengiriman === "PICKUP"
                ? "Metode Pengambilan Toko (O2O)"
                : "Alamat Pengiriman Kurir"}
            </h2>

            {order.tipePengiriman === "PICKUP" ? (
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  Pelanggan memilih untuk mengambil pesanan langsung di toko fisik.
                </p>
                {order.pickupCode && (
                  <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">
                        Kode Verifikasi Pengambilan
                      </p>
                      <p className="font-mono text-base font-black text-purple-900 dark:text-purple-200">
                        {order.pickupCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                {order.alamatPengiriman || "Tidak ada alamat pengiriman tercatat."}
              </div>
            )}
          </div>

          {/* Alterasi Request (Jika ada) */}
          {order.alterasi && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">
                Layanan Alterasi & Hemming
              </h3>
              <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                {order.alterasi.potongPanjang && (
                  <p>• Potong Panjang: <b>{order.alterasi.potongPanjang} cm</b></p>
                )}
                {order.alterasi.sesuaikanPinggang && (
                  <p>• Sesuaikan Pinggang: <b>{order.alterasi.sesuaikanPinggang} cm</b></p>
                )}
                {order.alterasi.catatan && (
                  <p>• Catatan: <i>"{order.alterasi.catatan}"</i></p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Kontrol Status, Resi, Customer, Ringkasan */}
        <div className="space-y-6">
          {/* Panel Kontrol Status */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              Kontrol Status Pesanan
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Perubahan status di sini langsung tercermin di halaman akun customer.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* PAID -> PROCESSING */}
              <button
                type="button"
                onClick={() => updateStatus("PROCESSING")}
                disabled={isUpdating || currentStatus === "PROCESSING"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  currentStatus === "PROCESSING"
                    ? "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-400 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} /> 1. DIPROSES (PROCESSING)
                </div>
                {currentStatus === "PROCESSING" && <CheckCircle2 size={16} />}
              </button>

              {/* PROCESSING -> SHIPPED */}
              <button
                type="button"
                onClick={() => {
                  if (order.tipePengiriman === "PICKUP") {
                    updateStatus("READY_FOR_PICKUP");
                  } else {
                    updateStatus("SHIPPED", resiInput.trim() || undefined);
                  }
                }}
                disabled={
                  isUpdating ||
                  currentStatus === "SHIPPED" ||
                  currentStatus === "READY_FOR_PICKUP"
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  currentStatus === "SHIPPED" ||
                  currentStatus === "READY_FOR_PICKUP"
                    ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {order.tipePengiriman === "PICKUP" ? (
                    <>
                      <Store size={16} /> 2. SIAP DIAMBIL (PICKUP)
                    </>
                  ) : (
                    <>
                      <Truck size={16} /> 2. DIKIRIM (SHIPPED)
                    </>
                  )}
                </div>
                {(currentStatus === "SHIPPED" ||
                  currentStatus === "READY_FOR_PICKUP") && (
                  <CheckCircle2 size={16} />
                )}
              </button>

              {/* SHIPPED / READY -> DELIVERED */}
              <button
                type="button"
                onClick={() => updateStatus("DELIVERED")}
                disabled={isUpdating || currentStatus === "DELIVERED"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  currentStatus === "DELIVERED"
                    ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <PackageCheck size={16} /> 3. SELESAI (DELIVERED)
                </div>
                {currentStatus === "DELIVERED" && <CheckCircle2 size={16} />}
              </button>

              {/* Opsi Lainnya: Tandai Bayar atau Batal */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                {currentStatus === "UNPAID" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("PAID")}
                    disabled={isUpdating}
                    className="text-[11px] font-bold text-green-600 hover:underline cursor-pointer"
                  >
                    Tandai Dibayar (PAID)
                  </button>
                )}
                {currentStatus !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Yakin ingin membatalkan pesanan ini?")) {
                        updateStatus("CANCELLED");
                      }
                    }}
                    disabled={isUpdating}
                    className="text-[11px] font-semibold text-red-500 hover:underline ml-auto cursor-pointer"
                  >
                    Batalkan Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Nomor Resi Kurir */}
          {order.tipePengiriman !== "PICKUP" && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-3">
              <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Truck size={18} className="text-blue-600" />
                Nomor Resi Pengiriman
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Masukkan nomor resi ekspedisi agar pelanggan dapat melacak paket secara mandiri.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={resiInput}
                  onChange={(e) => setResiInput(e.target.value)}
                  placeholder="Contoh: JNE-8820192819"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveResiOnly}
                  disabled={isSavingResi}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingResi ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Simpan Nomor Resi
                </button>
              </div>
            </div>
          )}

          {/* Pelanggan Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Informasi Pelanggan
            </h2>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {order.user?.name || "Pelanggan Tanpa Nama"}
              </p>
              <p className="text-gray-500">{order.user?.email || "-"}</p>
              <p className="text-gray-500">{order.user?.phone || "-"}</p>
            </div>
          </div>

          {/* Rincian Pembayaran */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Informasi Pembayaran
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentStatus}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Metode</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {order.metodePembayaran}
                </span>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Ref / Token</span>
                  <span className="font-mono text-gray-900 dark:text-white truncate max-w-[140px]">
                    {order.paymentReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  Total Bayar
                </span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-base">
                  Rp {order.totalHarga.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
