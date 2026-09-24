import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ produkId: string }> }
) {
  try {
    const { produkId } = await params;
    const produk = await prisma.kategoriPilihanProduk.findUnique({
      where: { id: produkId },
      include: {
        images: { orderBy: { isUtama: "desc" } },
        kategoriPilihan: { select: { id: true, nama: true, slug: true } },
      },
    });
    if (!produk) {
      return NextResponse.json({ data: null }, { status: 404 });
    }
    return NextResponse.json({ data: produk });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
