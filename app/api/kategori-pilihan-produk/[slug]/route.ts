import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const kategori = await prisma.kategoriPilihan.findFirst({
      where: {
        OR: [
          { slug },
          { slug: slug.toLowerCase() },
          { nama: { equals: slug.replace(/-/g, " "), mode: "insensitive" } },
        ],
      },
      include: {
        produk: {
          include: { images: { orderBy: { isUtama: "desc" } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!kategori) {
      return NextResponse.json({ data: null }, { status: 404 });
    }
    return NextResponse.json({ data: kategori });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
