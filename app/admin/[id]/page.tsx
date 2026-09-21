"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Truck, PackageCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/akun/pesanan/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setOrder(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/pesanan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update status");
      
      setOrder({ ...order, status: newStatus });
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-bold">Pesanan tidak ditemukan.</div>;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/pesanan" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 uppercase">#{order.id.split('-')[0]}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Update status pesanan ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Daftar Barang</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                    {item.image ? <img src={item.image} alt={item.nama} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{item.nama}</p>
                    <p className="text-sm text-gray-500">
                      {[item.warna && item.warna !== "-" ? item.warna : null, item.ukuran && item.ukuran !== "-" ? `Size ${item.ukuran}` : null].filter(Boolean).join(" - ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{item.qty}x</p>
                    <p className="text-sm text-gray-500">Rp {item.harga.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Alamat Pengiriman</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{order.alamatPengiriman || "O2O PICKUP DI TOKO"}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Informasi Pembayaran</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${order.status === 'UNPAID' ? 'text-red-500' : 'text-green-500'}`}>{order.status}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2 pt-2">
                <span className="text-gray-500">Metode</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.metodePembayaran || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2 pt-2">
                <span className="text-gray-500">Midtrans Token</span>
                <span className="font-mono text-gray-900 dark:text-white">{order.paymentReference || "Belum ada"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Update Status</h2>
            <div className="space-y-3">
              <button 
                onClick={() => updateStatus("PROCESSING")} 
                disabled={isUpdating || order.status === "PROCESSING"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold border transition-all ${order.status === "PROCESSING" ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-amber-400 text-gray-700 dark:text-gray-300"}`}
              >
                <div className="flex items-center gap-2"><Clock size={18} /> PROCESSING</div>
                {order.status === "PROCESSING" && <CheckCircle2 size={18} />}
              </button>
              <button 
                onClick={() => updateStatus("SHIPPED")} 
                disabled={isUpdating || order.status === "SHIPPED"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold border transition-all ${order.status === "SHIPPED" ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-400 text-gray-700 dark:text-gray-300"}`}
              >
                <div className="flex items-center gap-2"><Truck size={18} /> SHIPPED</div>
                {order.status === "SHIPPED" && <CheckCircle2 size={18} />}
              </button>
              <button 
                onClick={() => updateStatus("DELIVERED")} 
                disabled={isUpdating || order.status === "DELIVERED"}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold border transition-all ${order.status === "DELIVERED" ? "bg-green-100 border-green-300 text-green-700" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-green-400 text-gray-700 dark:text-gray-300"}`}
              >
                <div className="flex items-center gap-2"><PackageCheck size={18} /> DELIVERED</div>
                {order.status === "DELIVERED" && <CheckCircle2 size={18} />}
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Ringkasan</h2>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Tipe</span>
              <span className="font-semibold text-gray-900 dark:text-white">{order.tipePengiriman}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Total Harga</span>
              <span className="font-bold text-primary">Rp {order.totalHarga?.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
