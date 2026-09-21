export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/midtrans";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib disertakan" }, { status: 400 });
    }

    const order = await prisma.pesanan.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.statusPesanan === "PAID" || order.statusPesanan === "DELIVERED") {
      return NextResponse.json({
        success: true,
        status: "PAID",
        statusPesanan: order.statusPesanan,
        orderId: order.id,
      });
    }

    // Cek langsung status transaksi ke server Midtrans
    const midtransStatus = await checkTransactionStatus(orderId);
    if (midtransStatus) {
      const status = midtransStatus.transaction_status;
      let method = midtransStatus.payment_type || order.metodePembayaran;
      if (method === "bank_transfer" && midtransStatus.va_numbers && midtransStatus.va_numbers.length > 0) {
        method = `VA ${midtransStatus.va_numbers[0].bank.toUpperCase()}`;
      } else if (method === "echannel") {
        method = "Mandiri Bill";
      }

      if (status === "settlement" || status === "capture") {
        await prisma.pesanan.update({
          where: { id: order.id },
          data: {
            statusPesanan: "PAID",
            metodePembayaran: method,
          },
        });

        try {
          revalidatePath(`/akun/pesanan/${order.id}`);
          revalidatePath("/akun/pesanan");
          revalidatePath("/admin/pesanan");
        } catch (e) {}

        return NextResponse.json({
          success: true,
          status: "PAID",
          statusPesanan: "PAID",
          orderId: order.id,
        });
      } else if (status === "pending") {
        return NextResponse.json({
          success: true,
          status: "PENDING",
          statusPesanan: "UNPAID",
          orderId: order.id,
        });
      } else if (status === "expire" || status === "cancel" || status === "deny") {
        await prisma.pesanan.update({
          where: { id: order.id },
          data: { statusPesanan: "CANCELLED" },
        });

        return NextResponse.json({
          success: true,
          status: "CANCELLED",
          statusPesanan: "CANCELLED",
          orderId: order.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: order.statusPesanan,
      statusPesanan: order.statusPesanan,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Payment check error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
