export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/midtrans";

export async function GET(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();

    const where: any = {};

    if (status && status !== "ALL") {
      if (status === "SHIPPED_OR_PICKUP") {
        where.statusPesanan = { in: ["SHIPPED", "READY_FOR_PICKUP"] };
      } else {
        where.statusPesanan = status;
      }
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { resiKurir: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.pesanan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            varian: {
              include: {
                produk: {
                  include: {
                    images: { where: { isUtama: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Sinkronisasi status Midtrans untuk pesanan UNPAID
    const unpaidOrders = orders.filter((o) => o.statusPesanan === "UNPAID");
    if (unpaidOrders.length > 0) {
      await Promise.all(
        unpaidOrders.map(async (order) => {
          try {
            const midtransStatus = await checkTransactionStatus(order.id);
            if (midtransStatus) {
              const txStatus = midtransStatus.transaction_status;
              let method = midtransStatus.payment_type;
              if (
                method === "bank_transfer" &&
                midtransStatus.va_numbers &&
                midtransStatus.va_numbers.length > 0
              ) {
                method = `VA ${midtransStatus.va_numbers[0].bank.toUpperCase()}`;
              } else if (method === "echannel") {
                method = "Mandiri Bill";
              }

              if (txStatus === "settlement" || txStatus === "capture") {
                order.statusPesanan = "PAID";
                order.metodePembayaran = method;
                await prisma.pesanan.update({
                  where: { id: order.id },
                  data: { statusPesanan: "PAID", metodePembayaran: method },
                });
              } else if (
                txStatus === "expire" ||
                txStatus === "cancel" ||
                txStatus === "deny"
              ) {
                order.statusPesanan = "CANCELLED";
                await prisma.pesanan.update({
                  where: { id: order.id },
                  data: { statusPesanan: "CANCELLED" },
                });
              }
            }
          } catch (e) {
            // Ignore midtrans sync errors in background
          }
        })
      );
    }

    const formatted = orders.map((order) => ({
      id: order.id,
      status: order.statusPesanan,
      statusPesanan: order.statusPesanan,
      tipePengiriman: order.tipePengiriman,
      resiKurir: order.resiKurir,
      totalHarga: order.totalHarga,
      metodePembayaran: order.metodePembayaran || "Transfer Bank",
      paymentReference: order.paymentReference,
      createdAt: order.createdAt,
      tanggal: new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      waktu:
        new Date(order.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      user: order.user,
      totalItems: order.items.reduce((sum, it) => sum + it.jumlah, 0),
      itemsPreview: order.items.slice(0, 3).map((it) => ({
        nama: it.varian?.produk?.nama || "Produk",
        ukuran: it.varian?.ukuran || "-",
        warna: it.varian?.warna || "-",
        qty: it.jumlah,
        image: it.gambar || it.varian?.produk?.images?.[0]?.url || "",
      })),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error fetching admin orders list:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
