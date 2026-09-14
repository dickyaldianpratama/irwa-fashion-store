import prisma from "@/lib/prisma";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    if (dbUser && dbUser.role === "ADMIN") {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

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
    { title: "Total Pelanggan", value: totalUsers.toString(), icon: Users, color: "bg-orange-500", text: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <Icon className={stat.text} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-96 flex flex-col items-center justify-center text-gray-500">
          <TrendingUp size={48} className="mb-4 opacity-50" />
          <p>Grafik Penjualan (Segera Hadir)</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-96 flex flex-col items-center justify-center text-gray-500">
          <ShoppingBag size={48} className="mb-4 opacity-50" />
          <p>Pesanan Terbaru (Segera Hadir)</p>
        </div>
      </div>
    </div>
  );
}
