import prisma from "@/lib/prisma";
import AdminTabNav from "@/components/admin/AdminTabNav";
import ProductTableClient from "@/components/admin/ProductTableClient";

export default async function AdminProdukPage() {
  const [dbProducts, koleksiItems, shopTheLookSets] = await Promise.all([
    prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        kategori: true,
        images: { where: { isUtama: true }, take: 1 },
        varian: true,
      },
    }),
    prisma.koleksiTerpopuler.findMany({
      orderBy: { urutan: "asc" },
    }),
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
      }
    })
  ]);

  const existingNames = new Set(dbProducts.map((p) => p.nama.toLowerCase().trim()));

  // Include standalone Koleksi Terpopuler items if not in main Produk
  const koleksiMapped = koleksiItems
    .filter((k) => k.title && !existingNames.has(k.title.toLowerCase().trim()))
    .map((k) => ({
      id: `koleksi-${k.id}`,
      nama: k.title,
      slug: k.link || `koleksi-${k.id}`,
      kategori: { nama: "Koleksi Terpopuler" },
      images: k.image ? [{ url: k.image }] : [],
      hargaAsli: k.hargaAsli || 0,
      hargaDiskon: k.hargaDiskon || null,
      varian: k.stok ? [{ stok: k.stok }] : [],
    }));

  // Include Shop The Look outfit sets if not in main Produk
  const shopTheLookMapped = shopTheLookSets
    .filter((stl) => stl.title && !existingNames.has(stl.title.toLowerCase().trim()))
    .map((stl) => ({
      id: `stl-${stl.id}`,
      nama: `[Look Set] ${stl.title}`,
      slug: `shop-the-look-${stl.id}`,
      kategori: { nama: "Shop The Look" },
      images: stl.image ? [{ url: stl.image }] : [],
      hargaAsli: stl.totalHarga || 0,
      hargaDiskon: null,
      varian: [],
    }));

  const allProducts = [...dbProducts, ...koleksiMapped, ...shopTheLookMapped];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Produk</h1>
      </div>

      <AdminTabNav />

      <ProductTableClient products={allProducts} />
    </div>
  );
}