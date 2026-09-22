import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cost, reward } = await request.json();
    if (!cost || cost <= 0 || !reward) return NextResponse.json({ error: "Invalid cost/reward" }, { status: 400 });

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    });

    const targetUserId = dbUser ? dbUser.id : user.id;

    const poin = await prisma.poin.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { userId: targetUserId }
        ]
      }
    });

    if (!poin || poin.saldo < cost) {
      return NextResponse.json({ error: "Poin tidak mencukupi" }, { status: 400 });
    }

    // Gunakan transaksi untuk memastikan potong poin dan buat voucher berhasil bersamaan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kurangi poin
      const updatedPoin = await tx.poin.update({
        where: { id: poin.id },
        data: { saldo: poin.saldo - cost }
      });

      // 2. Tentukan nilai berdasarkan title reward
      let nilai = 0;
      if (reward.type === "discount" && reward.title.includes("20.000")) nilai = 20000;
      else if (reward.type === "discount" && reward.title.includes("50.000")) nilai = 50000;
      else if (reward.type === "shipping") nilai = 30000;

      // 3. Buat Kode Unik
      const kodeUnik = reward.type.toUpperCase().substring(0, 4) + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // 4. Masukkan ke VoucherUser
      const newVoucher = await tx.voucherUser.create({
        data: {
          userId: targetUserId,
          kode: kodeUnik,
          judul: reward.title,
          tipe: reward.type,
          nilai: nilai,
          expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
        }
      });

      return { updatedPoin, newVoucher };
    });

    return NextResponse.json({ success: true, data: result.updatedPoin, voucher: result.newVoucher });
  } catch (error: any) {
    console.error("Error redeem poin:", error);
    return NextResponse.json({ error: "Gagal menukar poin" }, { status: 500 });
  }
}
