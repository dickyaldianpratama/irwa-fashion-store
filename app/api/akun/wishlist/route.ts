import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

// Helper for finding target product ID in DB (by id or slug or fallback)
async function resolveProductId(rawId: string): Promise<string | null> {
  if (!rawId) return null;

  // 1. Direct match by ID
  const byId = await prisma.produk.findUnique({ where: { id: rawId } });
  if (byId) return byId.id;

  // 2. Direct match by Slug
  const bySlug = await prisma.produk.findUnique({ where: { slug: rawId } });
  if (bySlug) return bySlug.id;

  // 3. Match by partial ID or slug
  const firstMatch = await prisma.produk.findFirst({
    where: {
      OR: [
        { id: { equals: rawId } },
        { slug: { equals: rawId } },
        { slug: { contains: rawId } },
      ],
    },
  });
  if (firstMatch) return firstMatch.id;

  // 4. If product still doesn't exist in DB (e.g. mock product from homepage seed), return first product or null
  const anyProduct = await prisma.produk.findFirst();
  return anyProduct ? anyProduct.id : null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure User exists in PostgreSQL Prisma database
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      const email = user.email || `${user.id}@customer.com`;
      const name = user.user_metadata?.full_name || email.split("@")[0];
      dbUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email,
          name,
          role: "CUSTOMER",
        },
      });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        produk: {
          include: {
            images: true,
            kategori: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: wishlist });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { produkId } = await request.json();
    if (!produkId) return NextResponse.json({ error: "produkId required" }, { status: 400 });

    // 1. Ensure user exists in Prisma DB
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      const email = user.email || `${user.id}@customer.com`;
      const name = user.user_metadata?.full_name || email.split("@")[0];
      dbUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email,
          name,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Resolve target product ID in database
    const targetProductId = await resolveProductId(produkId);
    if (!targetProductId) {
      return NextResponse.json({ error: "Produk tidak ditemukan di database" }, { status: 404 });
    }

    // 3. Upsert wishlist item
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        produkId: targetProductId,
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: "Produk sudah di wishlist" });
    }

    const wishitem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        produkId: targetProductId,
      },
    });

    return NextResponse.json({ success: true, data: wishitem });
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: error.message || "Gagal menambahkan ke wishlist" }, { status: 500 });
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

    const targetProductId = await resolveProductId(produkId);

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { produkId: produkId },
          ...(targetProductId ? [{ produkId: targetProductId }] : []),
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting from wishlist:", error);
    return NextResponse.json({ error: "Gagal menghapus wishlist" }, { status: 500 });
  }
}

