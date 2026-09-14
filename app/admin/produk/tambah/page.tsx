import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TambahProdukPage() {
  const categories = await prisma.kategori.findMany({
    orderBy: { nama: "asc" }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/produk" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Produk Baru</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
