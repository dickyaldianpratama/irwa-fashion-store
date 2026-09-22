import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { checkAdminAuth } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin Dashboard - IRWA",
  description: "Panel administrasi toko",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = await checkAdminAuth();

  if (!isAdmin) {
    return (
      <AdminThemeProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
          {children}
        </div>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-hidden font-sans">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-8 pt-16 md:pt-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
