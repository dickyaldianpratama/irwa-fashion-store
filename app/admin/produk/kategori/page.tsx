import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriManager from "@/components/admin/KategoriCard";

export default async function AdminKategoriPage() {
  await new Promise((resolve) => setTimeout(resolve, 600));
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Pilihan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambah, edit gambar/nama, atau hapus kategori yang tampil di homepage customer. 
            Kategori yang dihapus harus kosong (tidak ada produk di dalamnya).
          </p>
        </div>

        <KategoriManager kategori={kategori} />
      </div>
    </div>
  );
}
