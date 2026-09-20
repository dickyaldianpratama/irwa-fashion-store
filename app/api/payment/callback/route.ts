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
      // Midtrans Test Button mengirimkan order_id dummy. Kita harus merespon 200 OK agar tes berhasil.
      console.warn("Pesanan tidak ditemukan di DB, tapi Webhook valid:", order_id);
      return NextResponse.json({ success: true, message: "Pesanan tidak ditemukan (Test mode)" }, { status: 200 });
    }

    // Ambil info pembayaran spesifik dari Midtrans
    let metodeReal = data.payment_type || pesanan.metodePembayaran;
    if (metodeReal === 'bank_transfer' && data.va_numbers && data.va_numbers.length > 0) {
      metodeReal = `VA ${data.va_numbers[0].bank.toUpperCase()}`;
    } else if (metodeReal === 'echannel') {
      metodeReal = 'Mandiri Bill';
    }

    // Update status berdasarkan transaction_status Midtrans
    if (transaction_status === "capture" || transaction_status === "settlement") {
      await prisma.pesanan.update({
        where: { id: pesanan.id },
        data: { 
          statusPesanan: "PAID",
          metodePembayaran: metodeReal
        }
      });
      console.log(`[Webhook Midtrans] Pesanan ${pesanan.id} sukses DIBAYAR!`);
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      const cancelledPesanan = await prisma.pesanan.findUnique({
        where: { id: pesanan.id },
        include: {
          items: {
            include: {
              varian: {
                include: { produk: true }
              }
            }
          }
        }
      });

      if (cancelledPesanan && cancelledPesanan.statusPesanan === "UNPAID") {
        await prisma.pesanan.update({
          where: { id: pesanan.id },
          data: { statusPesanan: "CANCELLED" }
        });

        // Kembalikan stok yang sebelumnya dipotong
        for (const itm of cancelledPesanan.items) {
          if (itm.varian) {
            await prisma.productVariant.update({
              where: { id: itm.varian.id },
              data: {
                stok: { increment: itm.jumlah }
              }
            }).catch(() => {});

            // Cek apakah produk ini berasal dari KoleksiTerpopuler
            const koleksi = await prisma.koleksiTerpopuler.findUnique({
              where: { id: itm.varian.produk.slug }
            }).catch(() => null);

            if (koleksi) {
              try {
                const parsed = JSON.parse(koleksi.itemsData || "[]");
                let restored = false;
                for (let p of parsed) {
                  const matchUkuran = Array.isArray(p.ukuran) ? p.ukuran.includes(itm.varian.ukuran) : p.ukuran === itm.varian.ukuran;
                  if (matchUkuran) {
                    p.stok = (p.stok || 0) + itm.jumlah;
                    restored = true;
                    break;
                  }
                }
                if (!restored && parsed.length > 0) {
                  parsed[0].stok = (parsed[0].stok || 0) + itm.jumlah;
                }
                const newTotal = parsed.reduce((a: number, b: any) => a + (b.stok || 0), 0);
                await prisma.koleksiTerpopuler.update({
                  where: { id: koleksi.id },
                  data: {
                    itemsData: JSON.stringify(parsed),
                    stok: newTotal
                  }
                });
              } catch (e) {}
            }
          }
        }
      }
      console.log(`[Webhook Midtrans] Pesanan ${pesanan.id} DIBATALKAN/EXPIRED!`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Midtrans Callback Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
