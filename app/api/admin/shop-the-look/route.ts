import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

// Helper: cek admin
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return dbUser;
}

// GET — ambil semua look
export async function GET() {
  try {
    const looks = await prisma.shopTheLook.findMany({
      include: {
        items: {
          include: {
            produk: {
              include: {
                images: { where: { isUtama: true }, take: 1 }
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    });
    return NextResponse.json({ data: looks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — buat look baru
export async function POST(request: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, deskripsi, image, totalHarga, produkIds } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ error: "Title dan gambar wajib diisi" }, { status: 400 });
    }

    const newLook = await prisma.shopTheLook.create({
      data: {
        title,
        deskripsi: deskripsi || "",
        image,
        totalHarga: totalHarga || 0,
        items: {
          create: (produkIds || []).map((produkId: string) => ({ produkId }))
        }
      },
      include: {
        items: { include: { produk: true } }
      }
    });

    return NextResponse.json({ success: true, data: newLook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
