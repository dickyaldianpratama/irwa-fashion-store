import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const { id } = await context.params;

    // Check if product is in any orders
    const variants = await prisma.productVariant.findMany({
      where: { produkId: id },
      select: { id: true }
    });
    
    const variantIds = variants.map(v => v.id);
    
    const orderItems = await prisma.itemPesanan.count({
      where: { varianId: { in: variantIds } }
    });

    if (orderItems > 0) {
      return NextResponse.json(
        { error: "Produk tidak bisa dihapus karena sudah pernah dipesan oleh pelanggan. Ubah status stok menjadi 0 jika ingin menonaktifkan." },
        { status: 400 }
      );
    }

    await prisma.produk.delete({
      where: { id }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const { id } = await context.params;
    const body = await request.json();
    const { nama, slug, deskripsi, hargaAsli, hargaDiskon, labelPromo, isPreOrder, kategoriId, imageUrl, varians } = body;

    // Update produk
    const updatedProduct = await prisma.produk.update({
      where: { id },
      data: {
        nama,
        slug,
        deskripsi,
        hargaAsli,
        hargaDiskon,
        labelPromo,
        isPreOrder,
        kategoriId,
      }
    });

    // Update gambar utama
    if (imageUrl) {
      // Hapus gambar lama (isUtama: true)
      await prisma.productImage.deleteMany({
        where: { produkId: id, isUtama: true }
      });
      // Buat gambar baru
      await prisma.productImage.create({
        data: {
          produkId: id,
          url: imageUrl,
          isUtama: true
        }
      });
    }

    // Update varian
    if (varians && varians.length > 0) {
      // Karena varian bisa tambah/hapus, pendekatan paling aman:
      // Hapus yang tidak ada di payload, update yang ada ID-nya, buat yang baru.
      
      const incomingIds = varians.map((v: any) => v.id).filter(Boolean);
      
      // Hapus varian yang ID-nya tidak dikirim (dihapus oleh user), 
      // KECUALI varian yang sudah dipesan. Ini agak kompleks, tapi untuk simplicity:
      // Kita coba deleteMany yang tidak di-include.
      try {
        await prisma.productVariant.deleteMany({
          where: {
            produkId: id,
            id: { notIn: incomingIds }
          }
        });
      } catch (err: any) {
        // Jika gagal delete karena constraint (sudah dipesan), biarkan saja stoknya jadi 0
        await prisma.productVariant.updateMany({
          where: {
            produkId: id,
            id: { notIn: incomingIds }
          },
          data: { stok: 0 }
        });
      }

      // Upsert varians (update if ID exists, create if not)
      for (const v of varians) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { warna: v.warna, ukuran: v.ukuran, stok: v.stok }
          });
        } else {
          await prisma.productVariant.create({
            data: { produkId: id, warna: v.warna, ukuran: v.ukuran, stok: v.stok }
          });
        }
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
