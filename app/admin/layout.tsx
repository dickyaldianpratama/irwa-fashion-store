import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard - IRWA",
  description: "Panel administrasi toko",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/"); // Kick out non-admins
  }

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-hidden font-sans">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-8 pt-16 md:pt-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
