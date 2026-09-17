import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminTabNav from "@/components/admin/AdminTabNav";
import ProductTableClient from "@/components/admin/ProductTableClient";

export default async function AdminProdukPage() {
  const products = await prisma.produk.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kategori: true,
      images: { where: { isUtama: true }, take: 1 },
      varian: true,
    },
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

      <ProductTableClient products={products} />
    </div>
  );
}