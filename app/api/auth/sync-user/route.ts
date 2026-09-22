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
    const name = body.name || user?.user_metadata?.full_name || email?.split("@")[0] || "Customer";

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    let dbUser;

    if (existingUser) {
      // Perbaiki nama jika pernah tertimpa oleh akun lain (misal: email bgdicky tapi nama yudha)
      const isMismatchName =
        existingUser.name.toLowerCase().includes("yudha") &&
        !email.toLowerCase().includes("yudha");

      dbUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name: isMismatchName || !existingUser.name ? name : existingUser.name,
        },
      });
    } else {
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: name || email.split("@")[0],
          role: "CUSTOMER",
          poin: {
            create: {
              saldo: 0,
              levelMember: "BRONZE",
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error("Error syncing customer user to DB:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

