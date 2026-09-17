import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KategoriPilihanManager from "@/components/admin/KategoriPilihanManager";

export default async function AdminKategoriPilihanPage() {
  const kategori = await prisma.kategoriPilihan.findMany({
    orderBy: { nama: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Pilihan (Home)</h1>
        <Link 
          href="/admin/produk/tambah" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Produk
        </Link>
      </div>

      <AdminTabNav />
      <KategoriPilihanManager kategori={kategori} />
    </div>
  );
}