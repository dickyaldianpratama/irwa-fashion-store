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

export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, image, link, urutan } = await request.json();
    if (!title || !image) {
      return NextResponse.json({ error: "Title dan image wajib diisi" }, { status: 400 });
    }

    const newData = await prisma.koleksiTerpopuler.create({
      data: { title, image, link: link || null, urutan: parseInt(urutan) || 0 },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: newData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, title, image, link, urutan } = await request.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const updated = await prisma.koleksiTerpopuler.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(image && { image }),
        ...(link !== undefined && { link }),
        ...(urutan !== undefined && { urutan: parseInt(urutan) }),
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    await prisma.koleksiTerpopuler.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}