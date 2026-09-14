import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        produk: {
          include: {
            images: {
              where: { isUtama: true },
              take: 1
            },
            varian: true,
            kategori: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: wishlist });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { produkId } = await request.json();
    if (!produkId) return NextResponse.json({ error: "produkId required" }, { status: 400 });

    const wishitem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        produkId: produkId
      }
    });

    return NextResponse.json({ success: true, data: wishitem });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Produk sudah ada di wishlist" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambahkan ke wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const produkId = searchParams.get("produkId");

    if (!produkId) return NextResponse.json({ error: "produkId required" }, { status: 400 });

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        produkId: produkId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus wishlist" }, { status: 500 });
  }
}
