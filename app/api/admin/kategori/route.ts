import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.kategoriPilihan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ulasan: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        ratings: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const body = await request.json();
    const {
      nama,
      image,
      deskripsi,
      hargaAsli,
      hargaDiskon,
      labelPromo,
      rating,
      itemsData,
    } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const baseSlug = nama.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.kategoriPilihan.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const parsedHargaAsli = hargaAsli ? parseInt(hargaAsli) : null;
    const parsedHargaDiskon = hargaDiskon ? parseInt(hargaDiskon) : null;
    const parsedRating = rating ? parseFloat(rating) : 5.0;

    const newData = await prisma.kategoriPilihan.create({
      data: {
        nama: nama.trim(),
        slug,
        image: image || null,
        deskripsi: deskripsi || null,
        hargaAsli: parsedHargaAsli,
        hargaDiskon: parsedHargaDiskon,
        labelPromo: labelPromo || null,
        rating: parsedRating,
        itemsData: typeof itemsData === "string" ? itemsData : itemsData ? JSON.stringify(itemsData) : null,
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: newData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const body = await request.json();
    const {
      id,
      nama,
      image,
      slug,
      deskripsi,
      hargaAsli,
      hargaDiskon,
      labelPromo,
      rating,
      itemsData,
    } = body;

    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const parsedHargaAsli = hargaAsli !== undefined && hargaAsli !== null ? parseInt(hargaAsli) || null : undefined;
    const parsedHargaDiskon = hargaDiskon !== undefined && hargaDiskon !== null ? parseInt(hargaDiskon) || null : undefined;
    const parsedRating = rating !== undefined && rating !== null ? parseFloat(rating) || 5.0 : undefined;

    const updated = await prisma.kategoriPilihan.update({
      where: { id },
      data: {
        ...(nama && { nama: nama.trim() }),
        ...(slug && { slug }),
        ...(image !== undefined && { image }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(parsedHargaAsli !== undefined && { hargaAsli: parsedHargaAsli }),
        ...(parsedHargaDiskon !== undefined && { hargaDiskon: parsedHargaDiskon }),
        ...(labelPromo !== undefined && { labelPromo }),
        ...(parsedRating !== undefined && { rating: parsedRating }),
        ...(itemsData !== undefined && { itemsData: typeof itemsData === "string" ? itemsData : itemsData ? JSON.stringify(itemsData) : null }),
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
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    await prisma.kategoriPilihan.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}