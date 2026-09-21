"use client";

import { useState, useEffect } from "react";
import { Package, Search, ChevronRight, Clock, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type TabValue = "semua" | "berlangsung" | "selesai" | "dibatalkan";

export default function PesananPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("semua");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "semua", label: "Semua Pesanan" },
    { id: "berlangsung", label: "Sedang Berlangsung" },
    { id: "selesai", label: "Selesai" },
    { id: "dibatalkan", label: "Dibatalkan" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/akun/pesanan");
        if (res.ok) {
          const { data } = await res.json();
          setOrders(data || []);
        } else {
          toast.error("Gagal memuat daftar pesanan");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleHideOrder = async (id: string) => {
    // Optimistic update
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success("Pesanan berhasil disembunyikan", { icon: "🧹" });

    try {
      await fetch(`/api/akun/pesanan/${id}/hide`, { method: "PATCH" });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // 1. Filter Tab
    let isTabMatch = true;
    if (activeTab === "berlangsung") {
      isTabMatch = ["UNPAID", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED"].includes(order.statusPesanan);
    } else if (activeTab === "selesai") {
      isTabMatch = order.statusPesanan === "DELIVERED";
    } else if (activeTab === "dibatalkan") {
      isTabMatch = order.statusPesanan === "CANCELLED";
    }

    // 2. Filter Pencarian (ID Pesanan atau Nama Produk)
    let isSearchMatch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchProduct = order.items?.some((item: any) => 
        item.varian?.produk?.nama.toLowerCase().includes(q)
      );
      isSearchMatch = matchId || matchProduct;
    }

    return isTabMatch && isSearchMatch;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-primary" /> Pesanan Saya
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Pantau status pesanan, lacak pengiriman, dan unduh invoice Anda.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pesanan / invoice..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-6 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabValue)}
            className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? "text-primary" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Memuat pesanan...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center py-16 px-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchQuery ? "Pesanan Tidak Ditemukan" : "Belum Ada Pesanan"}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            {searchQuery 
              ? `Tidak ada pesanan yang cocok dengan pencarian "${searchQuery}".` 
              : "Anda belum pernah melakukan pemesanan. Yuk mulai belanja sekarang!"}
          </p>
          {!searchQuery && (
            <Link href="/#belanja" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              Mulai Belanja
            </Link>
          )}
        </div>
      ) : (
        /* List Pesanan */
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Pesanan Card Structure */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500">ID: {order.id.split("-")[0].toUpperCase()}</span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {/* --- DYNAMIC BADGE --- */}
                <div className={`px-3 py-1 text-xs font-bold rounded-full ${
                  order.statusPesanan === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                  order.statusPesanan === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                  order.statusPesanan === 'READY_FOR_PICKUP' ? 'bg-purple-100 text-purple-800' :
                  order.statusPesanan === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                  order.statusPesanan === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.statusPesanan === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.statusPesanan === 'DELIVERED' ? 'Selesai' :
                   order.statusPesanan === 'SHIPPED' ? 'Dikirim' :
                   order.statusPesanan === 'READY_FOR_PICKUP' ? 'Siap Diambil' :
                   order.statusPesanan === 'PROCESSING' ? 'Diproses' :
                   order.statusPesanan === 'PAID' ? 'Dibayar' :
                   order.statusPesanan === 'CANCELLED' ? 'Dibatalkan' :
                   'Menunggu Pembayaran'}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                    {(order.items?.[0] as any)?.gambar || order.items?.[0]?.varian?.produk?.images?.[0]?.url ? (
                      <img
                        src={(order.items?.[0] as any)?.gambar || order.items?.[0]?.varian?.produk?.images?.[0]?.url}
                        alt="Produk"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">Pesanan {order.items?.length || 0} Item</h4>
                    <p className="text-sm text-gray-500 mt-0.5">Total Harga: Rp {order.totalHarga.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex flex-row w-full md:w-auto items-center gap-3 mt-4 md:mt-0">
                  {(order.statusPesanan === "DELIVERED" || order.statusPesanan === "CANCELLED") && (
                    <button 
                      onClick={() => handleHideOrder(order.id)}
                      className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                      title="Sembunyikan Pesanan"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <Link 
                    href={`/akun/pesanan/${order.id}`}
                    className="flex-1 md:flex-none px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Lihat Detail <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

