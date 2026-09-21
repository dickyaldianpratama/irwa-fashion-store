import SalesChart from "@/components/admin/SalesChart";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowRight, Clock } from "lucide-react";
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

  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  const prevStartDate = new Date();
  prevStartDate.setDate(now.getDate() - 59);
  prevStartDate.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue,
    recentOrders,
    rangeOrders
  ] = await Promise.all([
    prisma.produk.count(),
    prisma.pesanan.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.pesanan.aggregate({
      _sum: { totalHarga: true },
      where: { statusPesanan: { in: ["DELIVERED", "SHIPPED", "READY_FOR_PICKUP", "PROCESSING", "PAID"] } }
    }),
    prisma.pesanan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.pesanan.findMany({
      where: {
        createdAt: { gte: prevStartDate, lte: now }
      },
      select: {
        id: true,
        totalHarga: true,
        statusPesanan: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const revenue = totalRevenue._sum?.totalHarga || 0;

  const validStatuses = ["DELIVERED", "SHIPPED", "READY_FOR_PICKUP", "PROCESSING", "PAID"];
  const currentOrders = rangeOrders.filter((o) => new Date(o.createdAt) >= startDate);
  const previousOrders = rangeOrders.filter((o) => new Date(o.createdAt) >= prevStartDate && new Date(o.createdAt) < startDate);

  const chartTotalRevenue = currentOrders
    .filter((o) => validStatuses.includes(o.statusPesanan))
    .reduce((sum, o) => sum + o.totalHarga, 0);

  const prevTotalRevenue = previousOrders
    .filter((o) => validStatuses.includes(o.statusPesanan))
    .reduce((sum, o) => sum + o.totalHarga, 0);

  const chartTotalOrders = currentOrders.filter((o) => validStatuses.includes(o.statusPesanan)).length;
  const prevTotalOrders = previousOrders.filter((o) => validStatuses.includes(o.statusPesanan)).length;

  let growthRate = 0;
  if (prevTotalRevenue > 0) {
    growthRate = Math.round(((chartTotalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100);
  } else if (chartTotalRevenue > 0) {
    growthRate = 100;
  }

  const avgOrderValue = chartTotalOrders > 0 ? Math.round(chartTotalRevenue / chartTotalOrders) : 0;

  const statusBreakdown: Record<string, number> = {};
  currentOrders.forEach((o) => {
    statusBreakdown[o.statusPesanan] = (statusBreakdown[o.statusPesanan] || 0) + 1;
  });

  // Customer Ordering Frequency Breakdown (email & name)
  const customerMap = new Map<string, {
    userId: string;
    email: string;
    name: string;
    periodOrders: number;
    lifetimeOrders: number;
    totalSpent: number;
  }>();

  currentOrders.forEach((o) => {
    if (validStatuses.includes(o.statusPesanan)) {
      const email = o.user?.email || "Tanpa Email";
      const name = o.user?.name || "Pelanggan";
      const key = `${email.toLowerCase()}___${name.toLowerCase()}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          userId: o.userId,
          email,
          name,
          periodOrders: 0,
          lifetimeOrders: 0,
          totalSpent: 0,
        });
      }

      const c = customerMap.get(key)!;
      c.periodOrders += 1;
      c.totalSpent += o.totalHarga;
    }
  });

  const customerStats = Array.from(customerMap.values())
    .sort((a, b) => b.periodOrders - a.periodOrders || b.totalSpent - a.totalSpent);

  const timelineMap = new Map<string, { label: string; dateKey: string; revenue: number; orders: number; unpaidOrders: number; buyers: { name: string; email: string; totalHarga: number }[] }>();
  const curr = new Date(startDate);
  while (curr <= now) {
    const dateKey = curr.toISOString().split("T")[0];
    const label = curr.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    timelineMap.set(dateKey, { label, dateKey, revenue: 0, orders: 0, unpaidOrders: 0, buyers: [] });
    curr.setDate(curr.getDate() + 1);
  }

  currentOrders.forEach((o) => {
    const dateKey = new Date(o.createdAt).toISOString().split("T")[0];
    if (timelineMap.has(dateKey)) {
      const item = timelineMap.get(dateKey)!;
      if (validStatuses.includes(o.statusPesanan)) {
        item.revenue += o.totalHarga;
        item.orders += 1;
        item.buyers.push({
          name: o.user?.name || "Pelanggan",
          email: o.user?.email || "Tanpa Email",
          totalHarga: o.totalHarga,
        });
      } else if (o.statusPesanan === "UNPAID") {
        item.unpaidOrders += 1;
      }
    }
  });

  const chartData = Array.from(timelineMap.values());
  let peakPeriod = { label: "-", revenue: 0 };
  chartData.forEach((d) => {
    if (d.revenue > peakPeriod.revenue) {
      peakPeriod = { label: d.label, revenue: d.revenue };
    }
  });

  const initialAnalyticsData = {
    summary: {
      totalRevenue: chartTotalRevenue,
      prevTotalRevenue,
      growthRate,
      totalOrders: chartTotalOrders,
      prevTotalOrders,
      avgOrderValue,
      peakPeriod,
      statusBreakdown,
      customerStats
    },
    chartData
  };

  const stats = [
    { title: "Total Pendapatan", value: `Rp ${revenue.toLocaleString("id-ID")}`, icon: DollarSign },
    { title: "Total Pesanan", value: totalOrders.toString(), icon: ShoppingBag },
    { title: "Total Produk", value: totalProducts.toString(), icon: Package },
    { title: "Total Pelanggan", value: totalUsers.toString(), icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ringkasan statistik & kinerja toko online</p>
        </div>
        <Link
          href="/admin/pesanan"
          className="px-4 py-2.5 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
        >
          Kelola Pesanan <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">{stat.value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-2xs">
                <Icon size={20} strokeWidth={1.8} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Sales Chart Component */}
      <SalesChart initialRange="30d" initialData={initialAnalyticsData} />

      {/* Pesanan Terbaru */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-blue-500" /> Pesanan Terbaru
            </h2>
            <Link
              href="/admin/pesanan"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Belum ada pesanan masuk.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <Link
                  key={ord.id}
                  href={`/admin/pesanan/${ord.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-50 dark:border-gray-800/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        #{ord.id.split("-")[0].toUpperCase()}
                      </span>
                      <span className="text-[11px] text-gray-400">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {ord.user?.name || ord.user?.email || "Pelanggan"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {new Date(ord.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xs text-gray-900 dark:text-white">
                      Rp {ord.totalHarga.toLocaleString("id-ID")}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      ord.statusPesanan === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : ord.statusPesanan === "SHIPPED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : ord.statusPesanan === "PROCESSING"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : ord.statusPesanan === "PAID"
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {ord.statusPesanan}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
