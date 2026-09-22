import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await context.params;

    // Set semua stok varian menjadi 0
    await prisma.productVariant.updateMany({
      where: { produkId: id },
      data: { stok: 0 }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: "Stok berhasil dikosongkan." });
  } catch (error: any) {
    console.error("Error deactivating product:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
