import prisma from "@/lib/prisma";
import AdminTabNav from "@/components/admin/AdminTabNav";
import ShopTheLookManager from "@/components/admin/ShopTheLookManager";

export default async function AdminShopTheLookPage() {
  const [looks, allProducts] = await Promise.all([
    prisma.shopTheLook.findMany({
      include: {
        items: {
          include: {
            produk: {
              include: {
                images: { where: { isUtama: true }, take: 1 }
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    }),
    prisma.produk.findMany({
      include: {
        images: { where: { isUtama: true }, take: 1 }
      },
      orderBy: { nama: "asc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
      </div>

      <AdminTabNav />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shop The Look</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Buat dan kelola outfit set yang tampil di section &quot;Shop The Look&quot; di homepage.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <ShopTheLookManager looks={looks} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}
