import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return dbUser;
}

// PATCH — edit look
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { title, deskripsi, image, totalHarga, produkIds } = await request.json();

    await prisma.shopTheLookItem.deleteMany({ where: { lookId: id } });

    const updated = await prisma.shopTheLook.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(image && { image }),
        ...(totalHarga !== undefined && { totalHarga }),
        items: {
          create: (produkIds || []).map((produkId: string) => ({ produkId }))
        }
      },
      include: {
        items: { include: { produk: true } }
      }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — hapus look
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.shopTheLook.delete({ where: { id } });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
