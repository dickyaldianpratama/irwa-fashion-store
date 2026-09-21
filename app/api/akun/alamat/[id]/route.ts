export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isUtama, title, detail, phone } = body;

    const existing = await prisma.alamat.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isUtama === true) {
        await tx.alamat.updateMany({
          where: { userId: user.id },
          data: { isUtama: false },
        });
      }

      const updateData: any = {};
      if (isUtama !== undefined) updateData.isUtama = isUtama;
      if (title) updateData.label = title.trim();
      if (detail) updateData.alamatLengkap = detail.trim();
      if (phone) updateData.telepon = phone.trim();

      return await tx.alamat.update({
        where: { id },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.label,
        detail: updated.alamatLengkap,
        phone: updated.telepon,
        penerima: updated.penerima,
        isUtama: updated.isUtama,
      },
    });
  } catch (error: any) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.alamat.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.alamat.delete({
        where: { id },
      });

      // Jika alamat yang dihapus adalah alamat utama, jadikan alamat lain sebagai utama
      if (existing.isUtama) {
        const nextAddress = await tx.alamat.findFirst({
          where: { userId: user.id },
          orderBy: { id: "asc" },
        });
        if (nextAddress) {
          await tx.alamat.update({
            where: { id: nextAddress.id },
            data: { isUtama: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
