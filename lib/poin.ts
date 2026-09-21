import prisma from "@/lib/prisma";
import { LevelMember } from "@prisma/client";

/**
 * Menghitung level membership berdasarkan saldo poin aktif
 * - BRONZE: < 1.000 Pts
 * - SILVER: 1.000 - 2.499 Pts
 * - GOLD: 2.500 - 4.999 Pts
 * - PLATINUM: >= 5.000 Pts
 */
export function calculateLevelMember(saldo: number): LevelMember {
  if (saldo >= 5000) return "PLATINUM";
  if (saldo >= 2500) return "GOLD";
  if (saldo >= 1000) return "SILVER";
  return "BRONZE";
}

/**
 * Menambahkan poin reward kepada pemesan saat pesanan berstatus DELIVERED (Selesai).
 * Aturan: 1 Poin per Rp 1.000 pembelanjaan (berlaku kelipatan).
 * Idempoten: Pesanan yang sudah pernah diberikan poin (poinEarned > 0) tidak akan diberikan dobel.
 */
export async function awardPointsForOrder(orderId: string) {
  try {
    const order = await prisma.pesanan.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        totalHarga: true,
        statusPesanan: true,
        poinEarned: true,
      },
    });

    if (!order || !order.userId) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    // Jika sudah pernah diberi poin, jangan dobel
    if (order.poinEarned > 0) {
      return {
        success: true,
        alreadyAwarded: true,
        pointsAwarded: order.poinEarned,
      };
    }

    // 1 Poin per Rp 1.000
    const pointsToAward = Math.floor(order.totalHarga / 1000);
    if (pointsToAward <= 0) {
      return { success: true, pointsAwarded: 0 };
    }

    // 1. Tambah saldo poin user (upsert)
    const userPoin = await prisma.poin.upsert({
      where: { userId: order.userId },
      create: {
        userId: order.userId,
        saldo: pointsToAward,
        levelMember: calculateLevelMember(pointsToAward),
      },
      update: {
        saldo: { increment: pointsToAward },
      },
    });

    // 2. Perbarui level member jika saldo baru mencapai batas tier berikutnya
    const newLevel = calculateLevelMember(userPoin.saldo);
    if (newLevel !== userPoin.levelMember) {
      await prisma.poin.update({
        where: { userId: order.userId },
        data: { levelMember: newLevel },
      });
    }

    // 3. Catat di pesanan bahwa poin sudah diberikan
    await prisma.pesanan.update({
      where: { id: orderId },
      data: { poinEarned: pointsToAward },
    });

    return {
      success: true,
      alreadyAwarded: false,
      pointsAwarded: pointsToAward,
      newSaldo: userPoin.saldo,
    };
  } catch (error: any) {
    console.error("Gagal menambahkan poin pesanan:", error);
    return { success: false, error: error.message };
  }
}
