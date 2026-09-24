import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all produk for a specific kategoriPilihanId or all
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategoriPilihanId = searchParams.get("kategoriPilihanId");
    const where = kategoriPilihanId ? { kategoriPilihanId } : {};
    const produk = await prisma.kategoriPilihanProduk.findMany({
      where,
      include: { images: { orderBy: { isUtama: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: produk });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Create a new produk
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kategoriPilihanId, nama, harga, hargaDiskon, ukuran, deskripsi, images } = body;
    if (!kategoriPilihanId || !nama || !harga) {
      return NextResponse.json({ error: "kategoriPilihanId, nama, dan harga wajib diisi" }, { status: 400 });
    }
    const produk = await prisma.kategoriPilihanProduk.create({
      data: {
        kategoriPilihanId,
        nama,
        harga: Number(harga),
        hargaDiskon: hargaDiskon ? Number(hargaDiskon) : null,
        ukuran: ukuran || null,
        deskripsi: deskripsi || null,
        images: {
          create: (images || []).map((item: any, idx: number) => {
            const url = typeof item === "string" ? item : item.url;
            const itemUkuran = typeof item === "object" ? item.ukuran : null;
            return {
              url,
              ukuran: itemUkuran || null,
              isUtama: idx === 0,
            };
          }),
        },
      },
      include: { images: true },
    });
    return NextResponse.json({ data: produk }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH: Update produk
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nama, harga, hargaDiskon, ukuran, deskripsi, images } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    // Delete old images then re-create
    await prisma.kategoriPilihanProdukImage.deleteMany({ where: { produkId: id } });

    const produk = await prisma.kategoriPilihanProduk.update({
      where: { id },
      data: {
        nama,
        harga: Number(harga),
        hargaDiskon: hargaDiskon ? Number(hargaDiskon) : null,
        ukuran: ukuran || null,
        deskripsi: deskripsi || null,
        images: {
          create: (images || []).map((item: any, idx: number) => {
            const url = typeof item === "string" ? item : item.url;
            const itemUkuran = typeof item === "object" ? item.ukuran : null;
            return {
              url,
              ukuran: itemUkuran || null,
              isUtama: idx === 0,
            };
          }),
        },
      },
      include: { images: true },
    });
    return NextResponse.json({ data: produk });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Delete produk
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    await prisma.kategoriPilihanProduk.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
