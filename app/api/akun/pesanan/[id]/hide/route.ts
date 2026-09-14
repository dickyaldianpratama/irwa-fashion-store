import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pesanan = await prisma.pesanan.findFirst({
      where: { id, userId: user.id }
    });

    if (!pesanan) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (pesanan.statusPesanan !== "DELIVERED" && pesanan.statusPesanan !== "CANCELLED") {
      return NextResponse.json({ error: "Hanya pesanan Selesai atau Dibatalkan yang dapat disembunyikan" }, { status: 400 });
    }

    const updatedPesanan = await prisma.pesanan.update({
      where: { id },
      data: { isHiddenByUser: true }
    });

    return NextResponse.json({ success: true, data: updatedPesanan });
  } catch (error: any) {
    console.error("Error hiding order:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
