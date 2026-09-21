export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.alamat.findMany({
      where: { userId: user.id },
      orderBy: [{ isUtama: "desc" }, { id: "asc" }],
    });

    const formatted = addresses.map((a) => ({
      id: a.id,
      title: a.label,
      detail: a.alamatLengkap,
      phone: a.telepon,
      penerima: a.penerima,
      kota: a.kota,
      kodePos: a.kodePos,
      isUtama: a.isUtama,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, detail, phone, penerima, kota, kodePos, isUtama } = body;

    if (!title || !detail || !phone) {
      return NextResponse.json(
        { error: "Nama alamat, alamat lengkap, dan nomor telepon wajib diisi" },
        { status: 400 }
      );
    }

    const count = await prisma.alamat.count({ where: { userId: user.id } });
    const shouldBeUtama = isUtama === true || count === 0;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const receiverName = penerima || dbUser?.name || "Penerima";

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeUtama && count > 0) {
        await tx.alamat.updateMany({
          where: { userId: user.id },
          data: { isUtama: false },
        });
      }

      return await tx.alamat.create({
        data: {
          userId: user.id,
          label: title.trim(),
          penerima: receiverName.trim(),
          telepon: phone.trim(),
          alamatLengkap: detail.trim(),
          kota: (kota || "Jakarta Selatan").trim(),
          kodePos: (kodePos || "12190").trim(),
          isUtama: shouldBeUtama,
        },
      });
    });

    const formatted = {
      id: newAddress.id,
      title: newAddress.label,
      detail: newAddress.alamatLengkap,
      phone: newAddress.telepon,
      penerima: newAddress.penerima,
      kota: newAddress.kota,
      kodePos: newAddress.kodePos,
      isUtama: newAddress.isUtama,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
