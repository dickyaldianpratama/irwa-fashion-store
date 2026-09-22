import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

// POST: Admin Login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Email atau password admin salah!" },
        { status: 401 }
      );
    }

    // Periksa apakah user di database ber-role ADMIN
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak: Akun Anda bukan Administrator!" },
        { status: 403 }
      );
    }

    // Set Cookie khusus Admin Session Token yang berdiri sendiri
    const cookieStore = await cookies();
    cookieStore.set("admin_session_token", dbUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
    });
  } catch (error: any) {
    console.error("Admin Login API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Admin Logout (Hanya menghapus cookie Admin tanpa mempengaruhi customer)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session_token");

    return NextResponse.json({ success: true, message: "Admin session cleared" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to logout admin" }, { status: 500 });
  }
}
