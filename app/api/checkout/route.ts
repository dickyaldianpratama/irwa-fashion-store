import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Anda harus login untuk melakukan checkout" }, { status: 401 });
    }

    const body = await request.json();
    const { items, totalHarga, tipePengiriman, pickupDetails, alterasiDetails, metodePembayaran, alamatPengiriman, voucherId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // 1. Lazy Seed Kategori Dummy (karena kita belum buat panel admin)
    const kategoriDummy = await prisma.kategori.upsert({
      where: { slug: "pakaian-pria" },
      update: {},
      create: {
        nama: "Pakaian Pria",
        slug: "pakaian-pria",
      }
    });

    // 2. Siapkan Array untuk ItemPesanan
    const pesananItems = [];

    // Loop keranjang dan buat Produk & Varian on-the-fly jika tidak ada
    for (const item of items) {
      // Karena ID produk dari frontend dummy biasanya string biasa spt "kemeja-linen", kita jadikan slug
      const produkSlug = item.productId || "produk-" + Math.random().toString(36).substring(7);

      const produk = await prisma.produk.upsert({
        where: { slug: produkSlug },
        update: {}, // Biarkan kosong, kita urus gambar di bawah
        create: {
          nama: item.nama || "Produk Pakaian",
          slug: produkSlug,
          deskripsi: "Deskripsi singkat produk " + item.nama,
          hargaAsli: item.harga,
          kategoriId: kategoriDummy.id,
        }
      });

      // Paksa sinkronisasi gambar produk (atasi masalah produk yang sudah terlanjur dibuat tanpa gambar)
      if (item.gambar) {
        const existingImage = await prisma.productImage.findFirst({
          where: { produkId: produk.id }
        });
        
        if (!existingImage) {
          await prisma.productImage.create({
            data: {
              produkId: produk.id,
              url: item.gambar,
              isUtama: true
            }
          });
        }
      }

      // Upsert Varian (Ukuran + Warna)
      // Kita pakai kombinasi produkId-ukuran-warna sebagai fake SKU untuk keunikan
      const skuDummy = `${produk.id}-${item.ukuran}-${item.warna}`;
      
      const varian = await prisma.productVariant.upsert({
        where: { sku: skuDummy },
        update: {},
        create: {
          produkId: produk.id,
          ukuran: item.ukuran,
          warna: item.warna,
          sku: skuDummy,
          stok: 100, // Dummy stok
        }
      });

      // Simpan referensi untuk ItemPesanan nanti
      pesananItems.push({
        varianId: varian.id,
        jumlah: item.jumlah,
        hargaSatuan: item.harga
      });
    }

    if (voucherId) { await prisma.voucherUser.update({ where: { id: voucherId }, data: { isUsed: true } }); }

    // 3. Buat Transaksi Pesanan Utama
    let pesananData: any = {
      userId: user.id,
      totalHarga: totalHarga,
      tipePengiriman: tipePengiriman === "O2O" || tipePengiriman === "PICKUP" ? "PICKUP" : (tipePengiriman === "ALTERATION" ? "ALTERATION" : "DELIVERY"),
      statusPesanan: "UNPAID",
      metodePembayaran: metodePembayaran || "Bank Transfer",
      alamatPengiriman: alamatPengiriman || null,
      items: {
        create: pesananItems
      }
    };

    // Tambahkan QR Code jika O2O Pickup
    if (pesananData.tipePengiriman === "PICKUP") {
      pesananData.pickupCode = `QR-PICKUP-${Date.now()}`;
      // Dalam sistem asli kita simpan lokasi & waktu di tabel khusus atau catatan, 
      // untuk saat ini kita bypass atau simpan jika schema mendukung.
    }

    const pesananBaru = await prisma.pesanan.create({
      data: pesananData
    });

    // 4. Jika ada Alterasi, buat request alterasi
    if (tipePengiriman === "ALTERATION" && alterasiDetails) {
      await prisma.alterasiRequest.create({
        data: {
          pesananId: pesananBaru.id,
          potongPanjang: alterasiDetails.potongPanjang || null,
          sesuaikanPinggang: alterasiDetails.sesuaikanPinggang || null,
          catatan: alterasiDetails.catatan || null,
        }
      });
    }

    
    // 5. Integrasi Midtrans (Buat transaksi Snap)
    let checkoutUrl = null;
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const midtransRef = pesananBaru.id; // Midtrans disarankan menggunakan ID asli dari database

      const midtransRes = await createSnapTransaction({
        orderId: midtransRef,
        grossAmount: totalHarga,
        customerName: dbUser?.name || "Customer",
        customerEmail: user.email || "customer@example.com",
        customerPhone: "08123456789", // Ambil dari form/profil
        items: items.map((i: any, index: number) => ({
          id: `ITEM-${index}`,
          name: i.nama,
          price: i.harga,
          quantity: i.jumlah
        }))
      });

      if (midtransRes && midtransRes.redirect_url) {
        checkoutUrl = midtransRes.redirect_url;
        
        await prisma.pesanan.update({
          where: { id: pesananBaru.id },
          data: {
            paymentReference: midtransRes.token,
            paymentUrl: checkoutUrl
          }
        });
      } else {
        console.warn("Midtrans gagal membuat transaksi:", midtransRes);
      }
    } catch (e) {
      console.error("Gagal Request Midtrans:", e);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: pesananBaru.id,
      checkoutUrl: checkoutUrl
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
