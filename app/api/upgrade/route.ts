import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu!" }, { status: 401 });
    }

    // Upsert the user as ADMIN
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { role: "ADMIN", email: user.email },
      create: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || "Admin",
        role: "ADMIN"
      }
    });

    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
