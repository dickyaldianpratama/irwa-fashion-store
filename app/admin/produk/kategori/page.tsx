import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriCard from "@/components/admin/KategoriCard";

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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Pilihan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola gambar dan nama setiap kategori yang tampil di homepage customer.
          </p>
        </div>

        {kategori.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="font-medium">Belum ada kategori</p>
            <p className="text-sm mt-1">Tambahkan kategori terlebih dahulu</p>
          </div>
        ) : (
          <KategoriCard kategori={kategori} />
        )}
      </div>
    </div>
  );
}