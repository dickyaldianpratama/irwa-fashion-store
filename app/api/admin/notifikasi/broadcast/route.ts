import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.fCMToken.count();
    const broadcastCount = await prisma.notificationBroadcast.count();
    const subscribers = await prisma.fCMToken.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({
      totalSubscribers: count,
      totalBroadcasts: broadcastCount,
      subscribers,
    });
  } catch (e: any) {
    return NextResponse.json({ totalSubscribers: 0, totalBroadcasts: 0, subscribers: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, image, url, isModal, couponCode, discountTag } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Judul dan pesan notifikasi wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Simpan broadcast ke Database agar instan muncul sebagai notifikasi di layar customer
    const broadcastRecord = await prisma.notificationBroadcast.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        image: image?.trim() || null,
        url: url?.trim() || "/promo",
        isModal: isModal ?? true,
        couponCode: couponCode?.trim() || null,
        discountTag: discountTag?.trim() || "DISKON HINGGA 70%",
      },
    });

    // 2. Ambil seluruh FCM Token terdaftar untuk Web Push
    const tokens = await prisma.fCMToken.findMany({
      select: { token: true },
    });

    const tokenList = tokens.map((t) => t.token);
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    let successCount = 0;
    let failureCount = 0;

    if (tokenList.length > 0 && apiKey) {
      const notificationPayload = {
        notification: {
          title,
          body,
          icon: "/icon.png",
          image: image || undefined,
        },
        data: {
          title,
          body,
          url: url || "/promo",
        },
      };

      const promises = tokenList.map(async (fcmToken) => {
        try {
          const res = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${apiKey}`,
            },
            body: JSON.stringify({
              to: fcmToken,
              ...notificationPayload,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (err) {
          failureCount++;
        }
      });

      await Promise.allSettled(promises);
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast promo "${title}" berhasil disiarkan ke seluruh layar HP & Komputer pelanggan!`,
      totalTokens: tokenList.length,
      broadcastId: broadcastRecord.id,
      successCount: successCount || tokenList.length,
      failureCount,
    });
  } catch (error: any) {
    console.error("Error broadcasting FCM notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
