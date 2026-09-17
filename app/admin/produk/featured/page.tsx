import prisma from "@/lib/prisma";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KoleksiTerpopulerManager from "@/components/admin/KoleksiTerpopulerManager";

export default async function AdminFeaturedPage() {
  const koleksi = await prisma.koleksiTerpopuler.findMany({
    orderBy: { urutan: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Koleksi Terpopuler (Home)</h1>
      </div>

      <AdminTabNav />
      <KoleksiTerpopulerManager koleksi={koleksi} />
    </div>
  );
}