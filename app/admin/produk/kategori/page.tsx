import prisma from "@/lib/prisma";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriPilihanManager from "@/components/admin/KategoriPilihanManager";

export default async function AdminKategoriPilihanPage() {
  const kategori = await prisma.kategoriPilihan.findMany({
    orderBy: { nama: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
      </div>

      <AdminTabNav />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Pilihan (Home)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambah, edit gambar/nama, atau hapus kategori visual yang tampil di homepage customer. Ini berdiri sendiri dan tidak terikat dengan Kategori Produk.
          </p>
        </div>

        <KategoriPilihanManager kategori={kategori} />
      </div>
    </div>
  );
}