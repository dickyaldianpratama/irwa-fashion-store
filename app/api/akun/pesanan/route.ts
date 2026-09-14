export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/midtrans";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua pesanan milik user ini beserta detail item dan produknya
    const pesanan = await prisma.pesanan.findMany({
      where: { 
        userId: user.id,
        isHiddenByUser: false
      },
      include: {
        items: {
          include: {
            varian: {
              include: {
                produk: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // --- SINKRONISASI MIDTRANS UNTUK LIST PESANAN ---
    const unpaidOrders = pesanan.filter(o => o.statusPesanan === "UNPAID");
    
    if (unpaidOrders.length > 0) {
      await Promise.all(unpaidOrders.map(async (order) => {
        const midtransStatus = await checkTransactionStatus(order.id);
        if (midtransStatus) {
          const status = midtransStatus.transaction_status;
          if (status === 'settlement' || status === 'capture') {
            order.statusPesanan = "PAID";
            await prisma.pesanan.update({
              where: { id: order.id },
              data: { statusPesanan: "PAID" }
            });
          } else if (status === 'expire' || status === 'cancel' || status === 'deny') {
            order.statusPesanan = "CANCELLED";
            await prisma.pesanan.update({
              where: { id: order.id },
              data: { statusPesanan: "CANCELLED" }
            });
          }
        }
      }));
    }
    // ---------------------------------------------

    return NextResponse.json({ success: true, data: pesanan });

  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
