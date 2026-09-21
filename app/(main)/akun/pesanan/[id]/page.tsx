"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Receipt,
  QrCode,
  ArrowLeft,
  Clock,
  Store,
  Image as ImageIcon,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Award,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Data dummy untuk mock-up UI (khusus id = 1)
const dummyOrder = {
  id: "INV-20260913-001",
  status: "READY_FOR_PICKUP",
  statusPesanan: "READY_FOR_PICKUP",
  tipePengiriman: "PICKUP",
  tanggal: "13 September 2026",
  lokasiPickup: "IRWA PIM (Pondok Indah Mall)",
  waktuPickup: "13 September 2026, 14:00 - 18:00 (Sesi Sore)",
  poinEarned: 548,
  items: [
    { id: 1, nama: "Kemeja Linen Premium", ukuran: "L", warna: "Navy", harga: 299000, qty: 1, image: "" },
    { id: 2, nama: "Celana Chino Slim Fit", ukuran: "32", warna: "Khaki", harga: 249000, qty: 1, image: "" },
  ],
  totalHarga: 548000,
};

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [hasCopiedResi, setHasCopiedResi] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchOrder = async () => {
    // Jika id = 1 (dari mockup success lama), pakai data dummy
    if (params.id === "1") {
      setOrder(dummyOrder);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/akun/pesanan/${params.id}`);
      if (res.ok) {
        const { data } = await res.json();
        setOrder(data);
      } else {
        toast.error("Pesanan tidak ditemukan di database.");
        router.push("/akun/pesanan");
      }
    } catch (error) {
      console.error("Gagal menarik data pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id, router]);

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setHasCopiedResi(true);
    toast.success("Nomor resi berhasil disalin!");
    setTimeout(() => setHasCopiedResi(false), 2000);
  };

  const handleConfirmReceived = async () => {
    if (!confirm("Konfirmasi bahwa Anda telah menerima pesanan ini dengan baik?")) {
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch(`/api/akun/pesanan/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_RECEIVED" }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal mengonfirmasi pesanan");
      }

      toast.success("Pesanan selesai! Poin reward telah ditambahkan ke akun Anda.");
      await fetchOrder();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Mencari data pesanan...</p>
      </div>
    );
  }

  if (!order) return null;

  // Logika UI Timeline Progress
  const currentStatus = order.statusPesanan || order.status;
  const isCancelled = currentStatus === "CANCELLED";
  const isPaid = !isCancelled && currentStatus !== "UNPAID";
  const isProcessed =
    !isCancelled &&
    ["PROCESSING", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED"].includes(
      currentStatus
    );
  const isReady =
    !isCancelled &&
    ["SHIPPED", "READY_FOR_PICKUP", "DELIVERED"].includes(currentStatus);
  const isDone = !isCancelled && currentStatus === "DELIVERED";

  const steps = [
    { label: "Dibuat", done: true },
    { label: "Dibayar", done: isPaid },
    { label: "Diproses", done: isProcessed },
    {
      label: order.tipePengiriman === "PICKUP" ? "Siap Diambil" : "Dikirim",
      done: isReady,
    },
    { label: "Selesai", done: isDone },
  ];

  const earnedPoints =
    order.poinEarned || Math.floor((order.totalHarga || 0) / 1000);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
            <p className="text-gray-500 text-sm">
              {order.id} • {order.tanggal} • {order.waktu}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {currentStatus === "UNPAID" && order.paymentUrl && (
            <a
              href={order.paymentUrl}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              Bayar Sekarang
            </a>
          )}
          <Link
            href={`/invoice/${order.id}`}
            target="_blank"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Receipt size={16} /> Unduh Invoice
          </Link>
        </div>
      </div>

      {/* Banner Dibatalkan */}
      {isCancelled && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center gap-4 text-red-700">
          <AlertCircle size={28} className="text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-base text-red-800">Pesanan Dibatalkan</h4>
            <p className="text-sm text-red-600 mt-0.5">
              Pesanan ini telah dibatalkan atau masa pembayaran telah kadaluarsa.
            </p>
          </div>
        </div>
      )}

      {/* Status Tracker */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-primary" size={20} /> Status Pelacakan
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentStatus === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800"
                : currentStatus === "SHIPPED"
                ? "bg-blue-100 text-blue-800"
                : currentStatus === "READY_FOR_PICKUP"
                ? "bg-purple-100 text-purple-800"
                : currentStatus === "PROCESSING"
                ? "bg-amber-100 text-amber-800"
                : currentStatus === "PAID"
                ? "bg-green-100 text-green-800"
                : currentStatus === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
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
        </div>

        <div className="relative">
          <div className="absolute left-[15px] sm:left-auto sm:top-[15px] top-0 bottom-0 sm:bottom-auto sm:w-full sm:h-1 w-1 bg-gray-100 z-0"></div>
          <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                    step.done
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {step.done ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    step.done ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Box Resi Kurir (Jika Tersedia) */}
        {order.resiKurir && (
          <div className="mt-8 bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Nomor Resi Ekspedisi
                </p>
                <p className="text-base font-bold text-gray-900 font-mono">
                  {order.resiKurir}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopyResi(order.resiKurir)}
              className="px-4 py-2 bg-white hover:bg-blue-100/50 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              {hasCopiedResi ? <Check size={14} /> : <Copy size={14} />}
              {hasCopiedResi ? "Tersalin!" : "Salin No. Resi"}
            </button>
          </div>
        )}

        {/* Banner Poin Reward Selesai */}
        {isDone && earnedPoints > 0 && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Poin Belanja Berhasil Didapatkan
                </p>
                <p className="text-base font-black text-gray-900">
                  +{earnedPoints.toLocaleString("id-ID")} Poin IRWA Club
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  1 Poin per Rp 1.000 pembelanjaan telah otomatis masuk ke akun Anda.
                </p>
              </div>
            </div>
            <Link
              href="/akun/poin"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs whitespace-nowrap transition-colors text-center shadow-xs"
            >
              Lihat Saldo Poin
            </Link>
          </div>
        )}

        {/* Tombol Konfirmasi Terima Pesanan oleh Customer (Jika status SHIPPED / READY) */}
        {(currentStatus === "SHIPPED" || currentStatus === "READY_FOR_PICKUP") && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                Pesanan sudah Anda terima?
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Konfirmasi penerimaan barang untuk menyelesaikan transaksi dan langsung mengklaim <b>+{earnedPoints.toLocaleString("id-ID")} Poin Reward</b>!
              </p>
            </div>
            <button
              onClick={handleConfirmReceived}
              disabled={isConfirming}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isConfirming ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Konfirmasi Terima Pesanan
            </button>
          </div>
        )}

        {/* Alert Siap Diambil (O2O Khusus) */}
        {(currentStatus === "READY_FOR_PICKUP" ||
          order.tipePengiriman === "PICKUP") &&
          order.qrCode && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                <QrCode size={32} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-800 text-lg">
                  {currentStatus === "READY_FOR_PICKUP"
                    ? "Pesanan Siap Diambil!"
                    : "Kode Pengambilan Tersedia"}
                </h3>
                <p className="text-green-700/80 text-sm mt-1">
                  Tunjukkan kode <strong>{order.qrCode}</strong> kepada kasir saat
                  Anda tiba di toko.
                </p>
              </div>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                Lihat Kode (O2O)
              </button>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Utama (Daftar Produk) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="text-primary" size={18} /> Daftar Produk
            </h3>

            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50"
                >
                  <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" size={32} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900">{item.nama}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.ukuran && item.ukuran !== "-" && (
                        <span className="text-xs text-gray-500">
                          Ukuran: <b className="text-gray-700">{item.ukuran}</b>
                        </span>
                      )}
                      {item.warna && item.warna !== "-" ? (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            Warna: <b className="text-gray-700">{item.warna}</b>
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <ShieldCheck
                            size={11}
                            className="text-emerald-600 shrink-0"
                          />
                          Kualitas Terjamin
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.qty} x Rp {item.harga.toLocaleString("id-ID")}
                      </p>
                      <p className="font-bold text-primary">
                        Rp {(item.qty * item.harga).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Samping (Info Pengiriman & Ringkasan) */}
        <div className="lg:col-span-1 space-y-6">
          {order.tipePengiriman === "PICKUP" ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="text-primary" size={18} /> Info Pengambilan (O2O)
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Lokasi Toko
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {order.lokasiPickup}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    Waktu Sesi
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {order.waktuPickup}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="text-primary" size={18} /> Alamat Pengiriman
              </h3>
              <div className="space-y-4">
                <div>
                  {order.alamatPengiriman ? (
                    order.alamatPengiriman
                      .split("\n")
                      .map((line: string, i: number) => (
                        <p
                          key={i}
                          className={`text-sm ${
                            i === 0
                              ? "font-bold text-gray-900"
                              : "text-gray-600 mt-1"
                          }`}
                        >
                          {line}
                        </p>
                      ))
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-900">
                        Alamat Tersimpan
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Gedung Cyber 2 Lantai 14, Jl. HR Rasuna Said, Jakarta
                        Selatan, 12950
                      </p>
                    </>
                  )}
                </div>
                {order.tipePengiriman === "ALTERATION" && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <p className="text-xs font-semibold text-orange-800">
                      Layanan Alterasi Aktif
                    </p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Produk Anda sedang disesuaikan sebelum dikirim.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Rincian Pembayaran</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-gray-900">
                  {order.metodePembayaran || "Transfer Bank"}
                </span>
              </div>
              {(() => {
                const subtotal = order.items.reduce(
                  (sum: number, item: any) => sum + item.harga * item.qty,
                  0
                );
                const shipping =
                  order.tipePengiriman === "PICKUP" ? 0 : 25000;
                const alteration =
                  order.tipePengiriman === "ALTERATION" ? 35000 : 0;
                const totalAkhir = order.totalHarga;
                const diskon =
                  subtotal + shipping + alteration - totalAkhir;
                return (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Produk</span>
                      <span className="font-semibold text-gray-900">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Biaya Pengiriman</span>
                      <span
                        className={
                          shipping === 0
                            ? "font-semibold text-green-600"
                            : "font-semibold text-gray-900"
                        }
                      >
                        {shipping === 0 ? "Gratis (O2O)" : "Rp 25.000"}
                      </span>
                    </div>
                    {alteration > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Biaya Alterasi</span>
                        <span className="font-semibold text-gray-900">
                          Rp 35.000
                        </span>
                      </div>
                    )}
                    {diskon > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Diskon Voucher</span>
                        <span>-Rp {diskon.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <hr className="border-gray-100 my-3" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base">
                        Total Bayar
                      </span>
                      <span className="font-bold text-primary text-xl">
                        Rp {totalAkhir.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* O2O QR Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center w-8 h-8 transition-colors text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Store size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Kode Pengambilan O2O
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tunjukkan kode QR atau ID pesanan di bawah ini kepada staf kasir
              kami di <strong>{order.lokasiPickup}</strong>.
            </p>

            <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-2xl mb-4 w-full flex flex-col items-center justify-center">
              <QrCode size={120} className="text-gray-900 mb-4" />
              <p className="font-mono font-bold tracking-widest text-lg text-gray-900 bg-gray-100 px-4 py-2 rounded-lg w-full break-all">
                {order.qrCode}
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-2 hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
