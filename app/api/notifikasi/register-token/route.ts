import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    // Upsert FCM Token into DB
    const savedToken = await prisma.fCMToken.upsert({
      where: { token },
      update: { updatedAt: new Date() },
      create: { token },
    });

    return NextResponse.json({ success: true, data: savedToken });
  } catch (error: any) {
    console.error("Error registering FCM Token in DB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
