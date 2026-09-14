import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tinggiBadan,
      beratBadan,
      lingkarDada,
      lingkarPinggang,
      lebarBahu,
      panjangLengan,
    } = body;

    // Pastikan user ada di tabel public.User (sinkronisasi manual jika trigger DB tidak ada)
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || "Customer",
      }
    });

    // Upsert data ukuran (jika belum ada dibuat, jika sudah diupdate)
    const ukuran = await prisma.ukuranUser.upsert({
      where: { userId: user.id },
      update: {
        tinggiBadan: parseFloat(tinggiBadan) || null,
        beratBadan: parseFloat(beratBadan) || null,
        lingkarDada: parseFloat(lingkarDada) || null,
        lingkarPinggang: parseFloat(lingkarPinggang) || null,
        lebarBahu: parseFloat(lebarBahu) || null,
        panjangLengan: parseFloat(panjangLengan) || null,
      },
      create: {
        userId: user.id,
        tinggiBadan: parseFloat(tinggiBadan) || null,
        beratBadan: parseFloat(beratBadan) || null,
        lingkarDada: parseFloat(lingkarDada) || null,
        lingkarPinggang: parseFloat(lingkarPinggang) || null,
        lebarBahu: parseFloat(lebarBahu) || null,
        panjangLengan: parseFloat(panjangLengan) || null,
      }
    });

    return NextResponse.json({ success: true, data: ukuran });

  } catch (error: any) {
    console.error("Error saving size profile:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ukuran = await prisma.ukuranUser.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true, data: ukuran });
  } catch (error: any) {
    console.error("Error fetching size profile:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
