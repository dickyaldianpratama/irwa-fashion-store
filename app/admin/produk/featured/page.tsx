import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminTabNav from "@/components/admin/AdminTabNav";
import FeaturedProductToggle from "@/components/admin/FeaturedProductToggle";

export default async function AdminFeaturedPage() {
  const products = await prisma.produk.findMany({
    include: {
      kategori: true,
      images: { where: { isUtama: true }, take: 1 },
    },
    orderBy: [{ isFeatured: "desc" }, { nama: "asc" }],
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Koleksi Terpopuler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pin produk yang ingin ditampilkan di section &quot;Koleksi Terpopuler&quot; di homepage.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <FeaturedProductToggle products={products} />
        </div>
      </div>
    </div>
  );
}
