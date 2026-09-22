import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Ensure user exists in Prisma DB by ID or Email
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    });

    if (!dbUser) {
      const email = user.email || `${user.id}@customer.com`;
      const name = user.user_metadata?.full_name || email.split("@")[0] || "Customer";
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email,
          name,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Cari Poin berdasarkan user.id ATAU dbUser.id
    let poin = await prisma.poin.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { userId: dbUser.id }
        ]
      }
    });

    if (!poin) {
      poin = await prisma.poin.create({
        data: { userId: dbUser.id, saldo: 0, levelMember: "BRONZE" }
      });
    } else if (poin.userId !== user.id) {
      // Pastikan userId pada tabel Poin selalu tersinkron dengan user.id Supabase
      poin = await prisma.poin.update({
        where: { id: poin.id },
        data: { userId: user.id }
      }).catch(() => poin);
    }

    return NextResponse.json({ success: true, data: poin });
  } catch (error: any) {
    console.error("Error fetching poin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
