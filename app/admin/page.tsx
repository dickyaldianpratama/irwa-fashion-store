import prisma from "@/lib/prisma";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
    prisma.produk.count(),
    prisma.pesanan.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.pesanan.aggregate({
      _sum: { totalHarga: true },
      where: { statusPesanan: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] } }
    })
  ]);

  const revenue = totalRevenue._sum?.totalHarga || 0;

  const stats = [
    { title: "Total Pendapatan", value: `Rp ${revenue.toLocaleString("id-ID")}`, icon: DollarSign, color: "bg-green-500", text: "text-green-500" },
    { title: "Total Pesanan", value: totalOrders.toString(), icon: ShoppingBag, color: "bg-blue-500", text: "text-blue-500" },
    { title: "Total Produk", value: totalProducts.toString(), icon: Package, color: "bg-purple-500", text: "text-purple-500" },
    { title: "Pelanggan Aktif", value: totalUsers.toString(), icon: Users, color: "bg-orange-500", text: "text-orange-500" },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Ringkasan aktivitas dan performa toko Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <Icon size={24} className={stat.text} />
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
                  <TrendingUp size={16} /> +12%
                </span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pesanan Terbaru</h2>
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Silakan lihat menu Pesanan untuk mengelola transaksi.</p>
        </div>
      </div>
    </div>
  );
}
