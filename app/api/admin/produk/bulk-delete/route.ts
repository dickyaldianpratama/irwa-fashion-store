import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Tidak ada produk yang dipilih" }, { status: 400 });
    }

    // Check if any product has orders
    const variants = await prisma.productVariant.findMany({
      where: { produkId: { in: ids } },
      select: { id: true, produkId: true }
    });
    
    const variantIds = variants.map(v => v.id);
    
    const orderItems = await prisma.itemPesanan.findMany({
      where: { varianId: { in: variantIds } },
      include: { varian: { select: { produk: { select: { nama: true } } } } }
    });

    if (orderItems.length > 0) {
      // Find which products have orders to give a helpful error
      const problematicProducts = [...new Set(orderItems.map(item => item.varian.produk.nama))];
      return NextResponse.json(
        { error: `Tidak bisa menghapus karena produk berikut sudah dipesan: ${problematicProducts.join(", ")}.` },
        { status: 400 }
      );
    }

    // Safely delete all
    await prisma.produk.deleteMany({
      where: { id: { in: ids } }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}