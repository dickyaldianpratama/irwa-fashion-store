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

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      },
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
    const cleanName = name ? name.trim() : "";

    // 1. Update nama di Supabase Auth Metadata
    if (cleanName) {
      await supabase.auth.updateUser({
        data: { full_name: cleanName }
      });
    }

    // 2. Update atau buat data User di Database Publik (Prisma)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    });

    let updatedUser;
    if (existing) {
      updatedUser = await prisma.user.update({
        where: { id: existing.id },
        data: {
          id: user.id,
          email: user.email || existing.email,
          name: cleanName || existing.name,
          phone: phone !== undefined ? phone : existing.phone,
          birthDate: birthDate ? new Date(birthDate) : existing.birthDate,
        }
      });
    } else {
      updatedUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: cleanName || "Customer",
          phone: phone || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          role: "CUSTOMER",
          poin: {
            create: {
              saldo: 0,
              levelMember: "BRONZE",
            },
          },
        }
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });

  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
