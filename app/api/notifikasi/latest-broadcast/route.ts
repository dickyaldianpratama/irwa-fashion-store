import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const latest = await prisma.notificationBroadcast.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: latest });
  } catch (error: any) {
    return NextResponse.json({ data: null });
  }
}
