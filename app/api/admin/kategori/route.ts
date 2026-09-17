import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

// GET — ambil semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { nama: "asc" },
      include: {
        _count: { select: { produk: true } }
      }
    });
    return NextResponse.json({ data: kategori });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update nama dan/atau gambar kategori
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, nama, image, slug } = await request.json();

    if (!id) return NextResponse.json({ error: "ID kategori diperlukan" }, { status: 400 });

    const updated = await prisma.kategori.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(slug && { slug }),
        ...(image !== undefined && { image }),
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
