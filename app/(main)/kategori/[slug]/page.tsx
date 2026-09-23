import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Layers, ShoppingBag } from "lucide-react";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";
import KoleksiCard from "@/components/beranda/KoleksiCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const cleanName = decodedSlug.replace(/-/g, " ");

  const cat =
    (await prisma.kategori.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
          { nama: { equals: cleanName, mode: "insensitive" } },
        ],
      },
    })) ||
    (await prisma.kategoriPilihan.findFirst({
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

  // Cari di Kategori atau KategoriPilihan dengan berbagai opsi pencarian
  const [kategoriDb, kategoriPilihanDb] = await Promise.all([
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
  ]);

  const categoryName =
    kategoriDb?.nama ||
    kategoriPilihanDb?.nama ||
    cleanName.replace(/\b\w/g, (l) => l.toUpperCase());

  // Ambil produk dari kategori relation
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
  } else {
    // Fallback: Cari produk langsung yang mengandung nama kategori atau slug
    const directProducts = await prisma.produk.findMany({
      where: {
        OR: [
          { kategori: { nama: { contains: categoryName, mode: "insensitive" } } },
          { kategori: { slug: { contains: decodedSlug, mode: "insensitive" } } },
          { nama: { contains: categoryName, mode: "insensitive" } },
          { nama: { contains: cleanName, mode: "insensitive" } },
        ],
      },
      include: {
        images: { where: { isUtama: true }, take: 1 },
        kategori: true,
      },
      orderBy: { id: "desc" },
      take: 20,
    });

    if (directProducts.length > 0) {
      products = directProducts.map((p: any) => {
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
  }

  // Cari Koleksi Terpopuler yang relevan dengan nama kategori
  const relatedKoleksi = await prisma.koleksiTerpopuler.findMany({
    where: {
      OR: [
        { title: { contains: categoryName, mode: "insensitive" } },
        { title: { contains: cleanName, mode: "insensitive" } },
        { title: { contains: decodedSlug, mode: "insensitive" } },
      ],
    },
    take: 6,
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
            <Link
              href="/kategori"
              className="hover:text-primary transition-colors"
            >
              Kategori
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium capitalize">
              {categoryName}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Title */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
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
                Koleksi dan pakaian pilihan kategori {categoryName}
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

      <div className="container-app py-8">
        {/* Koleksi Terpopuler Terkait */}
        {relatedKoleksi.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                Koleksi Terpopuler {categoryName}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {relatedKoleksi.map((item) => (
                <KoleksiCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Produk Katalog */}
        {products.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Daftar Produk ({products.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : relatedKoleksi.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Belum Ada Produk di Kategori Ini
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
              Koleksi untuk kategori {categoryName} sedang disiapkan. Silakan
              lihat koleksi terpopuler kami yang lainnya.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/koleksi-terpopuler"
                className="btn btn-primary text-xs px-4 py-2"
              >
                Lihat Koleksi Terpopuler
              </Link>
              <Link
                href="/kategori"
                className="btn btn-secondary text-xs px-4 py-2"
              >
                Kategori Lainnya
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
