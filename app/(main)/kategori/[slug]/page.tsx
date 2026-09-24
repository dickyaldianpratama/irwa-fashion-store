import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShoppingBag } from "lucide-react";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const cleanName = decodedSlug.replace(/-/g, " ");

  const cat =
    (await prisma.kategoriPilihan.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
          { nama: { equals: cleanName, mode: "insensitive" } },
        ],
      },
    })) ||
    (await prisma.kategori.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
          { nama: { equals: cleanName, mode: "insensitive" } },
        ],
      },
    }));

  const name = cat ? cat.nama : cleanName;
  return {
    title: `Kategori ${name} | Irwa Fashion`,
    description: `Jelajahi berbagai pilihan ${name} terbaik dan tren terbaru di Irwa Fashion.`,
  };
}

export default async function KategoriDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const cleanName = decodedSlug.replace(/-/g, " ");

  // Cari nama kategori dari KategoriPilihan atau Kategori DB
  const [kategoriPilihanDb, kategoriDb] = await Promise.all([
    prisma.kategoriPilihan.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
          { nama: { equals: cleanName, mode: "insensitive" } },
          { nama: { contains: cleanName, mode: "insensitive" } },
        ],
      },
    }),
    prisma.kategori.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
          { nama: { equals: cleanName, mode: "insensitive" } },
          { nama: { contains: cleanName, mode: "insensitive" } },
        ],
      },
      include: {
        produk: {
          include: {
            images: { where: { isUtama: true }, take: 1 },
            kategori: true,
          },
          orderBy: { id: "desc" },
        },
      },
    }),
  ]);

  const categoryName =
    kategoriPilihanDb?.nama ||
    kategoriDb?.nama ||
    cleanName.replace(/\b\w/g, (l) => l.toUpperCase());

  // Ambil SELURUH produk yang cocok di toko (case-insensitive search berdasarkan kata kunci)
  let products: ProductType[] = [];

  if (kategoriDb?.produk && kategoriDb.produk.length > 0) {
    products = kategoriDb.produk.map((p: any) => {
      const mainImg =
        p.images[0]?.url ||
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
      return {
        id: p.id,
        slug: p.slug,
        name: p.nama,
        image: mainImg,
        price: p.hargaDiskon || p.hargaAsli,
        originalPrice: p.hargaDiskon ? p.hargaAsli : undefined,
        rating: p.rating || 4.8,
        soldCount: p.terjual || 0,
        badges: p.hargaDiskon ? ["SALE"] : undefined,
      };
    });
  }

  // Cari produk toko secara komprehensif berdasarkan kata kunci nama kategori (case-insensitive)
  const matchingProducts = await prisma.produk.findMany({
    where: {
      OR: [
        { nama: { contains: categoryName, mode: "insensitive" } },
        { nama: { contains: cleanName, mode: "insensitive" } },
        { deskripsi: { contains: categoryName, mode: "insensitive" } },
        { kategori: { nama: { contains: categoryName, mode: "insensitive" } } },
        { bahanKain: { contains: categoryName, mode: "insensitive" } },
        { occasion: { contains: categoryName, mode: "insensitive" } },
      ],
    },
    include: {
      images: { where: { isUtama: true }, take: 1 },
      kategori: true,
    },
    orderBy: { id: "desc" },
  });

  // Gabungkan produk tanpa duplikasi
  const existingIds = new Set(products.map((p) => p.id));
  matchingProducts.forEach((p: any) => {
    if (!existingIds.has(p.id)) {
      const mainImg =
        p.images[0]?.url ||
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
      products.push({
        id: p.id,
        slug: p.slug,
        name: p.nama,
        image: mainImg,
        price: p.hargaDiskon || p.hargaAsli,
        originalPrice: p.hargaDiskon ? p.hargaAsli : undefined,
        rating: p.rating || 4.8,
        soldCount: p.terjual || 0,
        badges: p.hargaDiskon ? ["SALE"] : undefined,
      });
      existingIds.add(p.id);
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-3">
          <nav className="flex items-center text-xs text-gray-500 gap-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <ChevronRight size={14} />
            <Link href="/kategori" className="hover:text-primary transition-colors">
              Kategori
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium capitalize">
              {categoryName}
            </span>
          </nav>
        </div>
      </div>

      {/* Header Judul Kategori */}
      <div className="bg-white border-b border-gray-100 py-6 shadow-xs">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">
                Katalog Produk
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">
                {categoryName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan {products.length} produk pakaian kategori {categoryName}
              </p>
            </div>
            <Link
              href="/kategori"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} /> Semua Kategori
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Katalog Produk (1 Card = 1 Produk) */}
      <div className="container-app py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Belum Ada Produk {categoryName}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
              Produk untuk kategori {categoryName} belum tersedia di toko. Silakan lihat katalog produk lainnya.
            </p>
            <Link href="/produk" className="btn btn-primary text-xs px-4 py-2">
              Lihat Semua Produk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
