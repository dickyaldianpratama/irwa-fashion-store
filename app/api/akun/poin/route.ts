import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Ensure user exists in Prisma DB
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      const email = user.email || `${user.id}@customer.com`;
      const name = user.user_metadata?.full_name || email.split("@")[0] || "Customer";
      dbUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email,
          name,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Inisialisasi awal poin (saldo: 0, level: BRONZE) jika belum ada
    let poin = await prisma.poin.findUnique({ where: { userId: user.id } });
    
    if (!poin) {
      poin = await prisma.poin.create({
        data: { userId: user.id, saldo: 0, levelMember: "BRONZE" }
      });
    }

    return NextResponse.json({ success: true, data: poin });
  } catch (error: any) {
    console.error("Error fetching poin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

