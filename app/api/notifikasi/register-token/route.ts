import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseDeviceInfo(userAgent: string | null): string {
  if (!userAgent) return "Perangkat Tidak Dikenal";

  let os = "Desktop";
  if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS (iPhone/iPad)";
  else if (/windows/i.test(userAgent)) os = "Windows PC";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/linux/i.test(userAgent)) os = "Linux";

  let browser = "Browser";
  if (/chrome|crios/i.test(userAgent) && !/edg/i.test(userAgent)) browser = "Chrome";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
  else if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";

  return `${os} (${browser})`;
}

export async function POST(req: NextRequest) {
  try {
    const { token, userId, deviceInfo: rawDeviceInfo } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const deviceInfo = rawDeviceInfo || parseDeviceInfo(userAgent);

    // Verify userId exists if passed
    let validUserId: string | null = null;
    if (userId && typeof userId === "string") {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) validUserId = userId;
    }

    // Upsert FCM Token into DB
    const savedToken = await prisma.fCMToken.upsert({
      where: { token },
      update: {
        updatedAt: new Date(),
        deviceInfo,
        ipAddress: ipAddress ? ipAddress.split(",")[0].trim() : undefined,
        ...(validUserId ? { userId: validUserId } : {}),
      },
      create: {
        token,
        deviceInfo,
        ipAddress: ipAddress ? ipAddress.split(",")[0].trim() : undefined,
        userId: validUserId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: savedToken });
  } catch (error: any) {
    console.error("Error registering FCM Token in DB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
