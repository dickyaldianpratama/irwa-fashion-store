import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function checkAdminAuth() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_session_token")?.value;

    if (adminToken) {
      const adminUser = await prisma.user.findUnique({
        where: { id: adminToken },
      });
      if (adminUser && adminUser.role === "ADMIN") {
        return { isAdmin: true, user: adminUser };
      }
    }

    // Fallback check via Supabase Auth user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (dbUser && dbUser.role === "ADMIN") {
        return { isAdmin: true, user: dbUser };
      }
    }

    return { isAdmin: false, user: null };
  } catch (err) {
    return { isAdmin: false, user: null };
  }
}
