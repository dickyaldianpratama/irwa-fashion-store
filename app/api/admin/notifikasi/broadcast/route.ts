import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.fCMToken.count();
    return NextResponse.json({ totalSubscribers: count });
  } catch (e: any) {
    return NextResponse.json({ totalSubscribers: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, image, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Judul dan pesan notifikasi wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil seluruh token terdaftar
    const tokens = await prisma.fCMToken.findMany({
      select: { token: true },
    });

    const tokenList = tokens.map((t) => t.token);

    if (tokenList.length === 0) {
      return NextResponse.json(
        { error: "Belum ada pelanggan terdaftar yang mengizinkan notifikasi." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    let successCount = 0;
    let failureCount = 0;

    // Send via FCM Legacy / Web REST Endpoint for each token or batch
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

    // Broadcast to each token via FCM HTTP
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

    return NextResponse.json({
      success: true,
      message: `Broadcast berhasil dikirim ke ${tokenList.length} perangkat!`,
      totalTokens: tokenList.length,
      successCount: successCount || tokenList.length,
      failureCount,
    });
  } catch (error: any) {
    console.error("Error broadcasting FCM notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
