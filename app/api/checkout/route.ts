export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    // SINKRONISASI USER: Pastikan user dari Supabase auth benar-benar ada di tabel public.User Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email || "customer@example.com",
        name: user.user_metadata?.name || user.email?.split('@')[0] || "Customer",
        role: "CUSTOMER"
      }
    });

    const body = await request.json();
    const { items, totalHarga, tipePengiriman, pickupDetails, alterasiDetails, metodePembayaran, alamatPengiriman, voucherId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // 1. VALIDASI STOK: Cek semua item di keranjang sebelum membuat pesanan
    for (const item of items) {
      if (!item.productId) continue;

      // Cek apakah item dari KoleksiTerpopuler
      const koleksi = await prisma.koleksiTerpopuler.findUnique({
        where: { id: item.productId }
      });

      if (koleksi) {
        let parsedItems: any[] = [];
        if (koleksi.itemsData) {
          try {
            parsedItems = JSON.parse(koleksi.itemsData);
          } catch (e) {}
        }

        let matchedPhoto = parsedItems.find((p: any) =>
          Array.isArray(p.ukuran) ? p.ukuran.includes(item.ukuran) : p.ukuran === item.ukuran
        );
        if (!matchedPhoto && item.gambar) {
          matchedPhoto = parsedItems.find((p: any) => p.image === item.gambar);
        }
        if (!matchedPhoto && parsedItems.length > 0) {
          matchedPhoto = parsedItems[0];
        }

        const availableStock = matchedPhoto && typeof matchedPhoto.stok === "number"
          ? matchedPhoto.stok
          : (koleksi.stok ?? 10);

        if (availableStock <= 0) {
          return NextResponse.json({
            error: `Maaf, stok untuk "${item.nama}" (Ukuran ${item.ukuran || "-"}) sudah habis dan tidak bisa dipesan!`
          }, { status: 400 });
        }

        if (availableStock < (item.jumlah || 1)) {
          return NextResponse.json({
            error: `Maaf, stok untuk "${item.nama}" (Ukuran ${item.ukuran || "-"}) hanya tersisa ${availableStock} pcs!`
          }, { status: 400 });
        }
      } else {
        // Cek Produk reguler
        const produk = await prisma.produk.findFirst({
          where: { OR: [{ id: item.productId }, { slug: item.productId }] },
          include: { varian: true }
        });

        if (produk && produk.varian && produk.varian.length > 0) {
          const matchedVariant = produk.varian.find((v: any) =>
            v.ukuran.toLowerCase() === (item.ukuran || "").toLowerCase()
          );
          if (matchedVariant) {
            if (matchedVariant.stok <= 0) {
              return NextResponse.json({
                error: `Maaf, stok untuk "${item.nama}" (Ukuran ${item.ukuran || "-"}) sudah habis!`
              }, { status: 400 });
            }
            if (matchedVariant.stok < (item.jumlah || 1)) {
              return NextResponse.json({
                error: `Maaf, stok untuk "${item.nama}" (Ukuran ${item.ukuran || "-"}) hanya tersisa ${matchedVariant.stok} pcs!`
              }, { status: 400 });
            }
          }
        }
      }
    }

    // 2. Lazy Seed Kategori Dummy (jika belum ada)
    const kategoriDummy = await prisma.kategori.upsert({
      where: { slug: "pakaian-pria" },
      update: {},
      create: {
        nama: "Pakaian Pria",
        slug: "pakaian-pria",
      }
    });

    // 3. Siapkan Array untuk ItemPesanan & KURANGI STOK DI DATABASE
    const pesananItems = [];

    for (const item of items) {
      const jumlahBeli = item.jumlah || 1;

      // A. Jika produk dari KoleksiTerpopuler, kurangi stok pada foto/ukuran dan total stok
      const koleksi = await prisma.koleksiTerpopuler.findUnique({
        where: { id: item.productId }
      });

      if (koleksi) {
        let parsedItems: any[] = [];
        if (koleksi.itemsData) {
          try {
            parsedItems = JSON.parse(koleksi.itemsData);
          } catch (e) {}
        }

        let updated = false;
        for (let p of parsedItems) {
          const matchUkuran = Array.isArray(p.ukuran)
            ? p.ukuran.includes(item.ukuran)
            : p.ukuran === item.ukuran;
          if (matchUkuran || (item.gambar && p.image === item.gambar)) {
            const currentPStok = typeof p.stok === "number" ? p.stok : (koleksi.stok ?? 10);
            p.stok = Math.max(0, currentPStok - jumlahBeli);
            updated = true;
            break;
          }
        }

        if (!updated && parsedItems.length > 0) {
          const currentPStok = typeof parsedItems[0].stok === "number" ? parsedItems[0].stok : (koleksi.stok ?? 10);
          parsedItems[0].stok = Math.max(0, currentPStok - jumlahBeli);
        }

        const newTotalStok = parsedItems.length > 0
          ? parsedItems.reduce((acc: number, curr: any) => acc + (curr.stok || 0), 0)
          : Math.max(0, (koleksi.stok ?? 10) - jumlahBeli);

        await prisma.koleksiTerpopuler.update({
          where: { id: koleksi.id },
          data: {
            itemsData: JSON.stringify(parsedItems),
            stok: newTotalStok,
          }
        });
      }

      // B. Sinkronisasi ke tabel Produk & Varian (untuk relasi Pesanan)
      const produkSlug = item.productId || "produk-" + Math.random().toString(36).substring(7);

      const produk = await prisma.produk.upsert({
        where: { slug: produkSlug },
        update: {
          terjual: { increment: jumlahBeli }
        },
        create: {
          nama: item.nama || "Produk Pakaian",
          slug: produkSlug,
          deskripsi: "Deskripsi singkat produk " + item.nama,
          hargaAsli: item.harga,
          kategoriId: kategoriDummy.id,
          terjual: jumlahBeli,
        }
      });

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

      const skuDummy = `${produk.id}-${item.ukuran}-${item.warna}`;
      const existingVarian = await prisma.productVariant.findUnique({
        where: { sku: skuDummy }
      });

      const initialVarianStok = existingVarian 
        ? Math.max(0, existingVarian.stok - jumlahBeli) 
        : Math.max(0, 100 - jumlahBeli);

      const varian = await prisma.productVariant.upsert({
        where: { sku: skuDummy },
        update: {
          stok: initialVarianStok
        },
        create: {
          produkId: produk.id,
          ukuran: item.ukuran || "-",
          warna: item.warna || "-",
          sku: skuDummy,
          stok: initialVarianStok,
        }
      });

      pesananItems.push({
        varianId: varian.id,
        jumlah: jumlahBeli,
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

    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin/produk/featured");
      revalidatePath("/koleksi-terpopuler");
    } catch (e) {}

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
    let snapToken = null;
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
        snapToken = midtransRes.token || null;
        
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
      checkoutUrl: checkoutUrl,
      token: snapToken
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
