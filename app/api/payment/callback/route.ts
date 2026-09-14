import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status
    } = data;

    // Verifikasi Keaslian Notifikasi
    const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
    
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid Midtrans signature" }, { status: 403 });
    }

    // Cari Pesanan berdasarkan order_id
    const pesanan = await prisma.pesanan.findUnique({
      where: { id: order_id }
    });

    if (!pesanan) {
      return NextResponse.json({ success: false, message: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Update status berdasarkan transaction_status Midtrans
    if (transaction_status === "capture" || transaction_status === "settlement") {
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: { statusPesanan: "PAID" }
      });
      console.log(`[Webhook Midtrans] Pesanan ${pesanan.id} sukses DIBAYAR!`);
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      await prisma.pesanan.update({
        where: { id: pesanan.id, statusPesanan: "UNPAID" },
        data: { statusPesanan: "CANCELLED" }
      });
      console.log(`[Webhook Midtrans] Pesanan ${pesanan.id} DIBATALKAN/EXPIRED!`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Midtrans Callback Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
