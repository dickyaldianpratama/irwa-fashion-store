import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

interface ItemPayload {
  id: string;
  image: string;
  ukuran: string[];
  stok?: number;
}

export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const body = await request.json();
    const {
      title,
      items,
      image: rawImage,
      itemsData: rawItemsData,
      link,
      urutan,
      hargaAsli,
      hargaDiskon,
      labelPromo,
      bestSellerBadge,
      badgeGaransi,
      rating,
      terjual,
      ukuran: rawUkuran,
      stok,
    } = body;

    // Parse and validate items
    let finalItems: ItemPayload[] = [];
    if (Array.isArray(items) && items.length > 0) {
      finalItems = items;
    } else if (rawItemsData) {
      try {
        finalItems = JSON.parse(rawItemsData);
      } catch (e) {}
    } else if (rawImage) {
      finalItems = [
        {
          id: "1",
          image: rawImage,
          ukuran: rawUkuran
            ? rawUkuran
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        },
      ];
    }

    if (!title || finalItems.length === 0 || !finalItems[0].image) {
      return NextResponse.json(
        { error: "Judul dan minimal 1 foto pakaian wajib diisi" },
        { status: 400 },
      );
    }

    // Pastikan setiap item hanya memiliki 1 ukuran dan stok angka
    finalItems = finalItems.map((item) => ({
      ...item,
      ukuran: Array.isArray(item.ukuran)
        ? item.ukuran.slice(0, 1)
        : typeof item.ukuran === "string" && item.ukuran
          ? [item.ukuran]
          : [],
      stok:
        item.stok !== undefined && item.stok !== null
          ? Math.max(0, parseInt(String(item.stok)) || 0)
          : 10,
    }));

    // Validasi setiap foto memiliki gambar dan tepat 1 ukuran
    for (let i = 0; i < finalItems.length; i++) {
      if (!finalItems[i].image) {
        return NextResponse.json(
          { error: `Foto ke-${i + 1} belum diupload` },
          { status: 400 },
        );
      }
      if (!finalItems[i].ukuran || finalItems[i].ukuran.length !== 1) {
        return NextResponse.json(
          { error: `Pilih 1 ukuran untuk foto ke-${i + 1}` },
          { status: 400 },
        );
      }
    }

    const coverImage = finalItems[0].image;
    const combinedUkuran = Array.from(
      new Set(finalItems.flatMap((i) => i.ukuran)),
    ).join(",");
    const serializedItemsData = JSON.stringify(finalItems);
    const totalStok =
      stok !== undefined && stok !== null && stok !== ""
        ? parseInt(String(stok))
        : finalItems.reduce((acc, curr) => acc + (curr.stok || 0), 0);

    const newData = await prisma.koleksiTerpopuler.create({
      data: {
        title,
        image: coverImage,
        itemsData: serializedItemsData,
        link: null,
        urutan: parseInt(urutan) || 0,
        hargaAsli: hargaAsli ? parseInt(hargaAsli) : null,
        hargaDiskon: hargaDiskon ? parseInt(hargaDiskon) : null,
        labelPromo: labelPromo || null,
        bestSellerBadge: bestSellerBadge || null,
        badgeGaransi: badgeGaransi || null,
        rating: rating || null,
        terjual: terjual || null,
        ukuran: combinedUkuran || null,
        stok: totalStok,
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, data: newData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const body = await request.json();
    const {
      id,
      title,
      items,
      image: rawImage,
      itemsData: rawItemsData,
      link,
      urutan,
      hargaAsli,
      hargaDiskon,
      labelPromo,
      bestSellerBadge,
      badgeGaransi,
      rating,
      terjual,
      ukuran: rawUkuran,
      stok,
    } = body;

    if (!id)
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    let finalItems: ItemPayload[] | undefined = undefined;
    if (Array.isArray(items) && items.length > 0) {
      finalItems = items;
    } else if (rawItemsData) {
      try {
        finalItems = JSON.parse(rawItemsData);
      } catch (e) {}
    } else if (rawImage) {
      finalItems = [
        {
          id: "1",
          image: rawImage,
          ukuran: rawUkuran
            ? rawUkuran
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        },
      ];
    }

    let coverImage: string | undefined = undefined;
    let combinedUkuran: string | undefined = undefined;
    let serializedItemsData: string | undefined = undefined;

    if (finalItems) {
      // Pastikan setiap item hanya memiliki 1 ukuran dan stok angka
      finalItems = finalItems.map((item) => ({
        ...item,
        ukuran: Array.isArray(item.ukuran)
          ? item.ukuran.slice(0, 1)
          : typeof item.ukuran === "string" && item.ukuran
            ? [item.ukuran]
            : [],
        stok:
          item.stok !== undefined && item.stok !== null
            ? Math.max(0, parseInt(String(item.stok)) || 0)
            : 10,
      }));

      for (let i = 0; i < finalItems.length; i++) {
        if (!finalItems[i].image) {
          return NextResponse.json(
            { error: `Foto ke-${i + 1} belum diupload` },
            { status: 400 },
          );
        }
        if (!finalItems[i].ukuran || finalItems[i].ukuran.length !== 1) {
          return NextResponse.json(
            { error: `Pilih 1 ukuran untuk foto ke-${i + 1}` },
            { status: 400 },
          );
        }
      }
      coverImage = finalItems[0].image;
      combinedUkuran = Array.from(
        new Set(finalItems.flatMap((i) => i.ukuran)),
      ).join(",");
      serializedItemsData = JSON.stringify(finalItems);
    }

    const calculatedStok =
      stok !== undefined && stok !== null && stok !== ""
        ? parseInt(String(stok))
        : finalItems
          ? finalItems.reduce((acc, curr) => acc + (curr.stok || 0), 0)
          : undefined;

    const updated = await prisma.koleksiTerpopuler.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(coverImage && { image: coverImage }),
        ...(serializedItemsData !== undefined && { itemsData: serializedItemsData }),
        ...(combinedUkuran !== undefined && { ukuran: combinedUkuran }),
        link: null,
        ...(urutan !== undefined && { urutan: parseInt(urutan) }),
        ...(hargaAsli !== undefined && {
          hargaAsli: hargaAsli ? parseInt(hargaAsli) : null,
        }),
        ...(hargaDiskon !== undefined && {
          hargaDiskon: hargaDiskon ? parseInt(hargaDiskon) : null,
        }),
        ...(labelPromo !== undefined && { labelPromo: labelPromo || null }),
        ...(bestSellerBadge !== undefined && {
          bestSellerBadge: bestSellerBadge || null,
        }),
        ...(badgeGaransi !== undefined && {
          badgeGaransi: badgeGaransi || null,
        }),
        ...(rating !== undefined && { rating: rating || null }),
        ...(terjual !== undefined && { terjual: terjual || null }),
        ...(calculatedStok !== undefined && { stok: calculatedStok }),
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin)
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const { id } = await request.json();
    if (!id)
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    await prisma.koleksiTerpopuler.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
