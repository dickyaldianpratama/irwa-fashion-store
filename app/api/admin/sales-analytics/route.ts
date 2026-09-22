import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { StatusPesanan } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let isMonthly = false;

    if (range === "7d") {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(now.getDate() - 13);
      prevStartDate.setHours(0, 0, 0, 0);
    } else if (range === "30d") {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(now.getDate() - 59);
      prevStartDate.setHours(0, 0, 0, 0);
    } else if (range === "6m") {
      isMonthly = true;
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setMonth(now.getMonth() - 11);
      prevStartDate.setDate(1);
      prevStartDate.setHours(0, 0, 0, 0);
    } else if (range === "12m") {
      isMonthly = true;
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setMonth(now.getMonth() - 23);
      prevStartDate.setDate(1);
      prevStartDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(now.getDate() - 59);
      prevStartDate.setHours(0, 0, 0, 0);
    }

    const validStatuses: StatusPesanan[] = ["DELIVERED", "SHIPPED", "READY_FOR_PICKUP", "PROCESSING", "PAID"];

    const [allOrders, userLifetimeOrders] = await Promise.all([
      prisma.pesanan.findMany({
        where: {
          createdAt: {
            gte: prevStartDate,
            lte: now,
          },
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
              email: true,
            },
          },
          items: {
            select: {
              jumlah: true,
              gambar: true,
              varian: {
                select: {
                  produk: {
                    select: {
                      nama: true,
                      images: { where: { isUtama: true }, take: 1, select: { url: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.pesanan.groupBy({
        by: ["userId"],
        _count: {
          _all: true
        },
        where: {
          statusPesanan: { in: validStatuses },
        },
      }),
    ]);

    const lifetimeMap = new Map<string, number>();
    userLifetimeOrders.forEach((item) => {
      if (item.userId) {
        lifetimeMap.set(item.userId, item._count._all);
      }
    });

    const currentOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= startDate
    );
    const previousOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= prevStartDate && new Date(o.createdAt) < startDate
    );

    const totalRevenue = currentOrders
      .filter((o) => validStatuses.includes(o.statusPesanan))
      .reduce((sum, o) => sum + o.totalHarga, 0);

    const prevTotalRevenue = previousOrders
      .filter((o) => validStatuses.includes(o.statusPesanan))
      .reduce((sum, o) => sum + o.totalHarga, 0);

    const totalOrders = currentOrders.filter((o) => validStatuses.includes(o.statusPesanan)).length;
    const prevTotalOrders = previousOrders.filter((o) => validStatuses.includes(o.statusPesanan)).length;

    let growthRate = 0;
    if (prevTotalRevenue > 0) {
      growthRate = Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100);
    } else if (totalRevenue > 0) {
      growthRate = 100;
    }

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const statusBreakdown: Record<string, number> = {};
    currentOrders.forEach((o) => {
      statusBreakdown[o.statusPesanan] = (statusBreakdown[o.statusPesanan] || 0) + 1;
    });

    // Customer Ordering Frequency & Favorite Products Breakdown
    interface CustomerProduct {
      nama: string;
      jumlah: number;
      image: string;
    }

    const customerMap = new Map<string, {
      userId: string;
      email: string;
      name: string;
      periodOrders: number;
      lifetimeOrders: number;
      totalSpent: number;
      productsMap: Map<string, CustomerProduct>;
    }>();

    currentOrders.forEach((o) => {
      if (validStatuses.includes(o.statusPesanan)) {
        const email = o.user?.email || "Tanpa Email";
        const name = o.user?.name || "Pelanggan";
        const key = `${email.toLowerCase()}___${name.toLowerCase()}`;
        const lifetime = lifetimeMap.get(o.userId) || 1;

        if (!customerMap.has(key)) {
          customerMap.set(key, {
            userId: o.userId,
            email,
            name,
            periodOrders: 0,
            lifetimeOrders: lifetime,
            totalSpent: 0,
            productsMap: new Map(),
          });
        }

        const c = customerMap.get(key)!;
        c.periodOrders += 1;
        c.totalSpent += o.totalHarga;

        if (o.items && o.items.length > 0) {
          o.items.forEach((it) => {
            const pName = it.varian?.produk?.nama || "Produk";
            const img = it.gambar || it.varian?.produk?.images?.[0]?.url || "";
            if (!c.productsMap.has(pName)) {
              c.productsMap.set(pName, { nama: pName, jumlah: 0, image: img });
            }
            c.productsMap.get(pName)!.jumlah += it.jumlah;
          });
        }
      }
    });

    const customerStats = Array.from(customerMap.values())
      .map((c) => ({
        userId: c.userId,
        email: c.email,
        name: c.name,
        periodOrders: c.periodOrders,
        lifetimeOrders: c.lifetimeOrders,
        totalSpent: c.totalSpent,
        topProducts: Array.from(c.productsMap.values())
          .sort((a, b) => b.jumlah - a.jumlah)
          .slice(0, 3)
      }))
      .sort((a, b) => b.periodOrders - a.periodOrders || b.totalSpent - a.totalSpent);

    // Generate buckets timeline
    interface TimelineBucket {
      label: string;
      dateKey: string;
      revenue: number;
      orders: number;
      unpaidOrders: number;
    }

    const timelineMap: Map<string, TimelineBucket> = new Map();

    if (!isMonthly) {
      const curr = new Date(startDate);
      while (curr <= now) {
        const dateKey = curr.toISOString().split("T")[0];
        const label = curr.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        timelineMap.set(dateKey, { label, dateKey, revenue: 0, orders: 0, unpaidOrders: 0 });
        curr.setDate(curr.getDate() + 1);
      }

      currentOrders.forEach((o) => {
        const dateKey = new Date(o.createdAt).toISOString().split("T")[0];
        if (timelineMap.has(dateKey)) {
          const item = timelineMap.get(dateKey)!;
          if (validStatuses.includes(o.statusPesanan)) {
            item.revenue += o.totalHarga;
            item.orders += 1;
          } else if (o.statusPesanan === "UNPAID") {
            item.unpaidOrders += 1;
          }
        }
      });
    } else {
      const curr = new Date(startDate);
      while (curr <= now) {
        const dateKey = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}`;
        const label = curr.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        if (!timelineMap.has(dateKey)) {
          timelineMap.set(dateKey, { label, dateKey, revenue: 0, orders: 0, unpaidOrders: 0 });
        }
        curr.setMonth(curr.getMonth() + 1);
      }

      currentOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (timelineMap.has(dateKey)) {
          const item = timelineMap.get(dateKey)!;
          if (validStatuses.includes(o.statusPesanan)) {
            item.revenue += o.totalHarga;
            item.orders += 1;
          } else if (o.statusPesanan === "UNPAID") {
            item.unpaidOrders += 1;
          }
        }
      });
    }

    const chartData = Array.from(timelineMap.values());

    let peakPeriod = { label: "-", revenue: 0 };
    chartData.forEach((d) => {
      if (d.revenue > peakPeriod.revenue) {
        peakPeriod = { label: d.label, revenue: d.revenue };
      }
    });

    return NextResponse.json({
      success: true,
      range,
      summary: {
        totalRevenue,
        prevTotalRevenue,
        growthRate,
        totalOrders,
        prevTotalOrders,
        avgOrderValue,
        peakPeriod,
        statusBreakdown,
        customerStats,
      },
      chartData,
    });
  } catch (error: any) {
    console.error("Error fetching sales analytics:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
