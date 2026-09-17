import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminTabNav from "@/components/admin/AdminTabNav";
import KoleksiTerpopulerManager from "@/components/admin/KoleksiTerpopulerManager";

export default async function AdminFeaturedPage() {
  const koleksi = await prisma.koleksiTerpopuler.findMany({
    orderBy: { urutan: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
        <Link 
          href="/admin/produk/tambah" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Produk
        </Link>
      </div>

      <AdminTabNav />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Koleksi Terpopuler (Home)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Atur banner koleksi yang akan tampil di halaman depan. Banner ini berdiri sendiri dan dapat diisi dengan gambar serta link bebas.
          </p>
        </div>
        
        <KoleksiTerpopulerManager koleksi={koleksi} />
      </div>
    </div>
  );
}