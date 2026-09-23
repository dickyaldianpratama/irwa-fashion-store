import prisma from "@/lib/prisma";
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
      </div>

      <AdminTabNav />

      <ProductTableClient products={products} />
    </div>
  );
}