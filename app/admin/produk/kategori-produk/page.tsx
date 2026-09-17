import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriManager from "@/components/admin/KategoriProdukManager";

export default async function AdminKategoriPage() {
  const kategori = await prisma.kategori.findMany({
    orderBy: { nama: "asc" },
    include: {
      _count: { select: { produk: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
        <Link
          href="/admin/produk/tambah"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          + Tambah Produk
        </Link>
      </div>

      <AdminTabNav />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Produk</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Daftar kategori asli untuk mengelompokkan produk Anda. Kategori ini akan muncul sebagai pilihan dropdown saat Anda menambah atau mengedit produk.
          </p>
        </div>

        <KategoriManager kategori={kategori} />
      </div>
    </div>
  );
}