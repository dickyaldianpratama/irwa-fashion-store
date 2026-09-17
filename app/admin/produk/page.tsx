import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import AdminTabNav from "@/components/admin/AdminTabNav";
import ProductTableActions from "@/components/admin/ProductTableActions";

export default async function AdminProdukPage() {
  const products = await prisma.produk.findMany({
    include: {
      kategori: true,
      images: { where: { isUtama: true }, take: 1 },
      varian: true,
    },
    orderBy: { createdAt: "desc" },
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

      {/* Tab Navigasi */}
      <AdminTabNav />

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Produk</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Kategori</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Harga</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Varian</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada produk. Silakan tambahkan produk baru.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                          {p.images[0]?.url ? (
                            <Image src={p.images[0].url} alt={p.nama} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{p.nama}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {p.kategori.nama}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                      Rp {p.hargaDiskon ? p.hargaDiskon.toLocaleString("id-ID") : p.hargaAsli.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {p.varian.length} varian
                    </td>
                    <td className="p-4">
                      <ProductTableActions productId={p.id} productName={p.nama} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
