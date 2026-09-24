import prisma from "@/lib/prisma";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriPilihanProdukManager from "@/components/admin/KategoriPilihanProdukManager";

export default async function AdminKategoriPilihanProdukPage() {
  const kategoriList = await prisma.kategoriPilihan.findMany({
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
      </div>

      <AdminTabNav />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Pilihan (Produk)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Input produk-produk secara manual untuk setiap kategori pilihan. Produk ini akan tampil di halaman customer saat memilih kategori.
          </p>
        </div>
        <KategoriPilihanProdukManager kategoriList={kategoriList} />
      </div>
    </div>
  );
}
