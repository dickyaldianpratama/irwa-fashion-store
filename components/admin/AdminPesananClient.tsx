"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Package,
  ArrowRight,
  Store,
  DollarSign,
  Copy,
  Check,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export interface OrderItemPreview {
  nama: string;
  ukuran: string;
  warna: string;
  qty: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  status: string;
  statusPesanan: string;
  tipePengiriman: "DELIVERY" | "PICKUP" | "ALTERATION";
  resiKurir?: string | null;
  totalHarga: number;
  metodePembayaran: string;
  paymentReference?: string | null;
  createdAt: string;
  tanggal: string;
  waktu: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  totalItems: number;
  itemsPreview: OrderItemPreview[];
}

interface Props {
  initialOrders: AdminOrder[];
}

type TabKey =
  | "ALL"
  | "UNPAID"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED_OR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export default function AdminPesananClient({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // State untuk modal kirim pesanan (Resi Kurir)
  const [shippingModalOrder, setShippingModalOrder] = useState<AdminOrder | null>(null);
  const [resiInput, setResiInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID Pesanan berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string,
    resiKurir?: string
  ) => {
    setUpdatingId(orderId);
    try {
      const payload: any = { status: newStatus };
      if (resiKurir !== undefined) {
        payload.resiKurir = resiKurir;
      }

      const res = await fetch(`/api/admin/pesanan/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui status pesanan");
      }

      // Update state lokal
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                statusPesanan: newStatus,
                ...(resiKurir !== undefined ? { resiKurir } : {}),
              }
            : o
        )
      );

      const statusLabels: Record<string, string> = {
        PAID: "Sudah Dibayar",
        PROCESSING: "Diproses",
        SHIPPED: "Sedang Dikirim",
        READY_FOR_PICKUP: "Siap Diambil",
        DELIVERED: "Selesai",
        CANCELLED: "Dibatalkan",
      };

      toast.success(
        `Status pesanan berhasil diubah ke: ${statusLabels[newStatus] || newStatus}`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmShipment = async () => {
    if (!shippingModalOrder) return;
    await handleUpdateStatus(shippingModalOrder.id, "SHIPPED", resiInput.trim());
    setShippingModalOrder(null);
    setResiInput("");
  };

  // Filter Data
  const filteredOrders = orders.filter((order) => {
    // 1. Filter Tab
    let matchTab = true;
    if (activeTab === "UNPAID") matchTab = order.statusPesanan === "UNPAID";
    else if (activeTab === "PAID") matchTab = order.statusPesanan === "PAID";
    else if (activeTab === "PROCESSING") matchTab = order.statusPesanan === "PROCESSING";
    else if (activeTab === "SHIPPED_OR_PICKUP")
      matchTab = ["SHIPPED", "READY_FOR_PICKUP"].includes(order.statusPesanan);
    else if (activeTab === "DELIVERED") matchTab = order.statusPesanan === "DELIVERED";
    else if (activeTab === "CANCELLED") matchTab = order.statusPesanan === "CANCELLED";

    // 2. Filter Search
    let matchSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const idMatch = order.id.toLowerCase().includes(q);
      const nameMatch = order.user?.name?.toLowerCase().includes(q) || false;
      const emailMatch = order.user?.email?.toLowerCase().includes(q) || false;
      const resiMatch = order.resiKurir?.toLowerCase().includes(q) || false;
      matchSearch = idMatch || nameMatch || emailMatch || resiMatch;
    }

    return matchTab && matchSearch;
  });

  // Statistik Ringkasan
  const totalCount = orders.length;
  const needsProcessingCount = orders.filter(
    (o) => o.statusPesanan === "PAID"
  ).length;
  const inProgressCount = orders.filter(
    (o) => o.statusPesanan === "PROCESSING"
  ).length;
  const shippingCount = orders.filter((o) =>
    ["SHIPPED", "READY_FOR_PICKUP"].includes(o.statusPesanan)
  ).length;
  const deliveredCount = orders.filter(
    (o) => o.statusPesanan === "DELIVERED"
  ).length;

  const totalRevenue = orders
    .filter((o) =>
      ["PAID", "PROCESSING", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED"].includes(
        o.statusPesanan
      )
    )
    .reduce((sum, o) => sum + o.totalHarga, 0);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "ALL", label: "Semua", count: totalCount },
    { key: "PAID", label: "Perlu Diproses", count: needsProcessingCount },
    { key: "PROCESSING", label: "Diproses", count: inProgressCount },
    { key: "SHIPPED_OR_PICKUP", label: "Dikirim / Siap Ambil", count: shippingCount },
    { key: "DELIVERED", label: "Selesai", count: deliveredCount },
    {
      key: "UNPAID",
      label: "Menunggu Bayar",
      count: orders.filter((o) => o.statusPesanan === "UNPAID").length,
    },
    {
      key: "CANCELLED",
      label: "Dibatalkan",
      count: orders.filter((o) => o.statusPesanan === "CANCELLED").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Pesanan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pantau dan kendalikan status pemrosesan, pengiriman, serta penyelesaian pesanan customer.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {totalCount}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Perlu Diproses
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {needsProcessingCount}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Sedang Dikirim
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {shippingCount}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Total Omzet
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pesanan, Pelanggan, atau No. Resi..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan <b>{filteredOrders.length}</b> dari {totalCount} pesanan
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 dark:border-gray-800 pt-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            Tidak ada pesanan ditemukan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada pesanan yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada pesanan dengan filter status ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs hover:border-gray-200 dark:hover:border-gray-700 transition-all space-y-4"
              >
                {/* Header Row: ID, Date, Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                      #{order.id.split("-")[0].toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleCopyId(order.id)}
                      title="Salin ID lengkap"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
                    >
                      {copiedId === order.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {order.tanggal}, {order.waktu}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tipe Pengiriman Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        order.tipePengiriman === "PICKUP"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {order.tipePengiriman === "PICKUP" ? (
                        <>
                          <Store size={12} /> Ambil Toko (O2O)
                        </>
                      ) : (
                        <>
                          <Truck size={12} /> Ekspedisi
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.statusPesanan === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : order.statusPesanan === "SHIPPED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : order.statusPesanan === "READY_FOR_PICKUP"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          : order.statusPesanan === "PROCESSING"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : order.statusPesanan === "PAID"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : order.statusPesanan === "CANCELLED"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                      }`}
                    >
                      {order.statusPesanan === "DELIVERED"
                        ? "Selesai"
                        : order.statusPesanan === "SHIPPED"
                        ? "Sedang Dikirim"
                        : order.statusPesanan === "READY_FOR_PICKUP"
                        ? "Siap Diambil"
                        : order.statusPesanan === "PROCESSING"
                        ? "Diproses"
                        : order.statusPesanan === "PAID"
                        ? "Sudah Dibayar"
                        : order.statusPesanan === "CANCELLED"
                        ? "Dibatalkan"
                        : "Menunggu Pembayaran"}
                    </span>
                  </div>
                </div>

                {/* Content Row: Customer info & Items Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Pemesan
                    </p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {order.user?.name || "Pelanggan Tanpa Nama"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {order.user?.email || "-"}
                    </p>
                    {order.user?.phone && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.user.phone}
                      </p>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Produk ({order.totalItems} pcs)
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.itemsPreview.map((item, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 overflow-hidden shrink-0"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                                Item
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                          {order.itemsPreview[0]?.nama || "Produk"}
                        </p>
                        {order.totalItems > 1 && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            +{order.totalItems - 1} item lainnya
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total & Resi */}
                  <div className="md:text-right space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Total Bayar
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      Rp {order.totalHarga.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.metodePembayaran}
                    </p>
                    {order.resiKurir && (
                      <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                        Resi: {order.resiKurir}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Row: Quick Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  {/* Status Steps Action Control */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Jika PAID -> Bisa langsung "Proses Pesanan" */}
                    {order.statusPesanan === "PAID" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, "PROCESSING")
                        }
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Clock size={14} />
                        )}
                        Proses Pesanan
                      </button>
                    )}

                    {/* Jika PROCESSING -> Kirim Pesanan (Resi) atau Siap Diambil */}
                    {order.statusPesanan === "PROCESSING" && (
                      <>
                        {order.tipePengiriman === "PICKUP" ? (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "READY_FOR_PICKUP")
                            }
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Store size={14} />
                            )}
                            Tandai Siap Diambil
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setShippingModalOrder(order);
                              setResiInput(order.resiKurir || "");
                            }}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Truck size={14} />
                            )}
                            Kirim Pesanan (Input Resi)
                          </button>
                        )}
                      </>
                    )}

                    {/* Jika SHIPPED atau READY_FOR_PICKUP -> Selesaikan Pesanan */}
                    {(order.statusPesanan === "SHIPPED" ||
                      order.statusPesanan === "READY_FOR_PICKUP") && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, "DELIVERED")
                        }
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Tandai Selesai
                      </button>
                    )}

                    {/* Jika UNPAID -> Bisa ditandai dibayar secara manual jika perlu */}
                    {order.statusPesanan === "UNPAID" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "PAID")}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-800 dark:bg-gray-800 dark:hover:bg-green-950 dark:text-gray-300 dark:hover:text-green-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        Tandai Dibayar Manual
                      </button>
                    )}

                    {/* Batalkan pesanan jika belum selesai/batal */}
                    {order.statusPesanan !== "DELIVERED" &&
                      order.statusPesanan !== "CANCELLED" && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Batalkan pesanan #${order.id.split("-")[0]}?`
                              )
                            ) {
                              handleUpdateStatus(order.id, "CANCELLED");
                            }
                          }}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          title="Batalkan Pesanan"
                        >
                          Batalkan
                        </button>
                      )}
                  </div>

                  {/* Tombol Detail Pesanan */}
                  <Link
                    href={`/admin/pesanan/${order.id}`}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye size={14} />
                    Lihat Detail
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Input Resi Kurir */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Kirim Pesanan #{shippingModalOrder.id.split("-")[0]}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status pesanan akan diubah menjadi <b>Sedang Dikirim (SHIPPED)</b>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nomor Resi Pengiriman (Ekspedisi)
              </label>
              <input
                type="text"
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value)}
                placeholder="Contoh: JNE-0192837192 / SICEPAT..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
                autoFocus
              />
              <p className="text-[11px] text-gray-400">
                Nomor resi ini akan langsung ditampilkan di halaman detail pesanan customer agar customer dapat melacak paketnya.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShippingModalOrder(null);
                  setResiInput("");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmShipment}
                disabled={updatingId === shippingModalOrder.id}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {updatingId === shippingModalOrder.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Konfirmasi Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
