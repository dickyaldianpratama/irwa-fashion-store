import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [categories, product] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { nama: "asc" } }),
    prisma.produk.findUnique({
      where: { id },
      include: {
        images: { where: { isUtama: true }, take: 1 },
        varian: true
      }
    })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/produk" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Produk</h1>
      </div>

      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}