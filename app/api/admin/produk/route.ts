import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { nama, slug, deskripsi, hargaAsli, hargaDiskon, labelPromo, isPreOrder, kategoriId, imageUrl, varians } = body;

    // Tambahkan suffiks acak ke slug agar unik jika kembar
    const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    const newProduct = await prisma.produk.create({
      data: {
        nama,
        slug: finalSlug,
        deskripsi: deskripsi || "",
        hargaAsli,
        hargaDiskon,
        labelPromo,
        isPreOrder,
        kategoriId,
        // Buat gambar utama
        images: {
          create: {
            url: imageUrl,
            isUtama: true
          }
        },
        // Buat variasi
        varian: {
          create: varians.map((v: any) => ({
            warna: v.warna || "Default",
            ukuran: v.ukuran || "All Size",
            stok: v.stok || 0
          }))
        }
      }
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

