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

// GET — ambil semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { nama: "asc" },
      include: { _count: { select: { produk: true } } }
    });
    return NextResponse.json({ data: kategori });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — buat kategori baru
export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { nama, image } = await request.json();
    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    // Auto-generate slug dari nama
    const baseSlug = nama.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // Pastikan slug unik
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.kategori.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newKategori = await prisma.kategori.create({
      data: { nama: nama.trim(), slug, image: image || null },
      include: { _count: { select: { produk: true } } }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: newKategori });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update nama dan/atau gambar kategori
export async function PATCH(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, nama, image, slug } = await request.json();
    if (!id) return NextResponse.json({ error: "ID kategori diperlukan" }, { status: 400 });

    const updated = await prisma.kategori.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(slug && { slug }),
        ...(image !== undefined && { image }),
      },
      include: { _count: { select: { produk: true } } }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — hapus kategori
export async function DELETE(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID kategori diperlukan" }, { status: 400 });

    // Cek apakah masih ada produk
    const count = await prisma.produk.count({ where: { kategoriId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak bisa dihapus. Masih ada ${count} produk dalam kategori ini. Pindahkan atau hapus produknya terlebih dahulu.` },
        { status: 400 }
      );
    }

    await prisma.kategori.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
