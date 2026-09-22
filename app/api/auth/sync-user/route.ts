import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const userId = body.userId || user?.id;
    const email = body.email || user?.email;
    const name = body.name || user?.user_metadata?.full_name || email?.split("@")[0] || "Pelanggan Baru";

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required" }, { status: 400 });
    }

    // Upsert customer into PostgreSQL User table
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        name,
      },
      create: {
        id: userId,
        email,
        name,
        role: "CUSTOMER",
        poin: {
          create: {
            saldo: 0,
            levelMember: "BRONZE",
          },
        },
      },
      include: {
        poin: true,
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error("Error syncing customer user to DB:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
