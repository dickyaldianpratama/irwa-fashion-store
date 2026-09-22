import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const defaultName =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer";

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: defaultName,
          role: "CUSTOMER",
          poin: {
            create: {
              saldo: 0,
              levelMember: "BRONZE",
            },
          },
        },
      });
    } else if (
      dbUser.name.toLowerCase().includes("yudha") &&
      !user.email?.toLowerCase().includes("yudha")
    ) {
      // Perbaiki nama yang sebelumnya sempat tertimpa
      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: defaultName,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: dbUser,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, birthDate } = body;

    // 1. Update nama di Supabase Auth Metadata
    if (name) {
      await supabase.auth.updateUser({
        data: { full_name: name }
      });
    }

    // 2. Update atau buat data User di Database Publik (Prisma)
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: name || user.user_metadata?.full_name,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: name || user.user_metadata?.full_name || "Customer",
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });

  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
