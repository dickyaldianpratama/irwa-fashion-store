import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

// PATCH — toggle isFeatured pada produk
export async function PATCH(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id, isFeatured } = await request.json();

    if (!id) return NextResponse.json({ error: "ID produk diperlukan" }, { status: 400 });

    const updated = await prisma.produk.update({
      where: { id },
      data: { isFeatured }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

