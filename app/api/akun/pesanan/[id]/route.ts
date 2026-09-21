export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/midtrans";
import { awardPointsForOrder } from "@/lib/poin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const isAdmin = dbUser?.role === "ADMIN";

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Admin bisa melihat pesanan apa pun, customer hanya miliknya sendiri
    const order = await prisma.pesanan.findFirst({
      where: isAdmin ? { id: id } : { id: id, userId: user.id },
      include: {
        user: true,
        items: {
          include: {
            varian: {
              include: {
                produk: {
                  include: { images: true }
                }
              }
            }
          }
        },
        alterasi: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // --- SINKRONISASI MIDTRANS (FALLBACK UNTUK LOCALHOST/WEBHOOK GAGAL) ---
    if (order.statusPesanan === "UNPAID") {
      const midtransStatus = await checkTransactionStatus(order.id);
      if (midtransStatus) {
        const status = midtransStatus.transaction_status;
        let method = midtransStatus.payment_type;
          if (method === 'bank_transfer' && midtransStatus.va_numbers && midtransStatus.va_numbers.length > 0) {
            method = `VA ${midtransStatus.va_numbers[0].bank.toUpperCase()}`;
          } else if (method === 'echannel') {
            method = 'Mandiri Bill';
          }
        
        if (status === 'settlement' || status === 'capture') {
          order.statusPesanan = "PAID";
          order.metodePembayaran = method;
          await prisma.pesanan.update({
            where: { id: order.id },
            data: { statusPesanan: "PAID", metodePembayaran: method }
          });
        } else if (status === 'expire' || status === 'cancel' || status === 'deny') {
          order.statusPesanan = "CANCELLED";
          await prisma.pesanan.update({
            where: { id: order.id },
            data: { statusPesanan: "CANCELLED" }
          });
        }
      }
    }
    // -------------------------------------------------------------------


    // Format ulang agar sesuai dengan struktur UI Frontend (Mock)
    const formattedOrder = {
      id: order.id,
      status: order.statusPesanan,
      statusPesanan: order.statusPesanan,
      tipePengiriman: order.tipePengiriman,
      resiKurir: order.resiKurir,
      poinEarned: order.poinEarned,
      pickupCode: order.pickupCode,
      tanggal: new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      waktu: new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB",
      lokasiPickup: order.tipePengiriman === "PICKUP" ? "IRWA Store Terdekat" : "Sesuai Alamat Pengiriman",
      waktuPickup: "Sesuai Jam Operasional",
      alamatPengiriman: order.alamatPengiriman,
      user: order.user,
      metodePembayaran: order.metodePembayaran || "Transfer Bank",
      items: order.items.map((item: any) => {
        const productImage = item.varian?.produk?.images?.[0]?.url;
        return {
          id: item.id,
          nama: item.varian?.produk?.nama || "Produk",
          ukuran: item.varian?.ukuran || "-",
          warna: item.varian?.warna || "-",
          harga: item.hargaSatuan,
          qty: item.jumlah,
          image: productImage || ""
        };
      }),
      totalHarga: order.totalHarga,
      qrCode: order.pickupCode,
      paymentUrl: order.paymentUrl,
      paymentReference: order.paymentReference
    };

    return NextResponse.json({ success: true, data: formattedOrder });

  } catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { action } = body;

    if (action !== "CONFIRM_RECEIVED") {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const order = await prisma.pesanan.findFirst({
      where: { id, userId: user.id }
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (!["SHIPPED", "READY_FOR_PICKUP"].includes(order.statusPesanan)) {
      return NextResponse.json({ error: "Pesanan belum dalam status pengiriman atau siap ambil" }, { status: 400 });
    }

    const updated = await prisma.pesanan.update({
      where: { id },
      data: { statusPesanan: "DELIVERED" }
    });

    // Otomatis berikan poin reward (1 Poin per Rp 1.000)
    const pointResult = await awardPointsForOrder(id);

    return NextResponse.json({
      success: true,
      data: updated,
      pointResult
    });
  } catch (error: any) {
    console.error("Error confirming order delivered:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
