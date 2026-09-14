import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let poin = await prisma.poin.findUnique({ where: { userId: user.id } });
    
    // Jika belum ada data poin, inisialisasi awal
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

