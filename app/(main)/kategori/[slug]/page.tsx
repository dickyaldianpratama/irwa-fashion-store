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

  // Try to find KategoriPilihan with its produk
  const kategoriPilihan = await prisma.kategoriPilihan.findFirst({
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
        include: { images: { orderBy: { isUtama: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const categoryName = kategoriPilihan?.nama ||
    cleanName.replace(/\b\w/g, (l) => l.toUpperCase());

  // If kategoriPilihan has manually input produk, use those
  if (kategoriPilihan && kategoriPilihan.produk.length > 0) {
    return (
      <div className="bg-gray-50 min-h-screen pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-app py-3">
            <nav className="flex items-center text-xs text-gray-500 gap-1">
              <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
              <ChevronRight size={14} />
              <Link href="/kategori" className="hover:text-primary transition-colors">Kategori</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium capitalize">{categoryName}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-100 py-6 shadow-xs">
          <div className="container-app">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">Katalog Produk</span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">{categoryName}</h1>
                <p className="text-sm text-gray-500 mt-1">Menampilkan {kategoriPilihan.produk.length} produk kategori {categoryName}</p>
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

        {/* Grid Produk dari KategoriPilihanProduk */}
        <div className="container-app py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {kategoriPilihan.produk.map((p) => {
              const mainImg = p.images.find(i => i.isUtama)?.url || p.images[0]?.url ||
                "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
              const isDiskon = p.hargaDiskon && p.hargaDiskon < p.harga;
              return (
                <Link
                  key={p.id}
                  href={`/kategori/${decodedSlug}/produk/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col"
                >
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img
                      src={mainImg}
                      alt={p.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isDiskon && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">DISKON</div>
                    )}
                    {p.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">+{p.images.length - 1} foto</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{p.nama}</p>
                    {p.ukuran && <p className="text-[10px] text-gray-400">{p.ukuran}</p>}
                    <div className="mt-auto pt-1">
                      {isDiskon ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.harga)}</p>
                          <p className="text-sm font-black text-primary">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.hargaDiskon!)}</p>
                        </>
                      ) : (
                        <p className="text-sm font-black text-gray-900">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.harga)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: keyword-based search from Produk table
  const kategoriDb = await prisma.kategori.findFirst({
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
  });

  let products: ProductType[] = [];

  if (kategoriDb?.produk && kategoriDb.produk.length > 0) {
    products = kategoriDb.produk.map((p: any) => {
      const mainImg = p.images[0]?.url || "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
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

  const existingIds = new Set(products.map((p) => p.id));
  matchingProducts.forEach((p: any) => {
    if (!existingIds.has(p.id)) {
      const mainImg = p.images[0]?.url || "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600";
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
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight size={14} />
            <Link href="/kategori" className="hover:text-primary transition-colors">Kategori</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium capitalize">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* Header Judul Kategori */}
      <div className="bg-white border-b border-gray-100 py-6 shadow-xs">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">Katalog Produk</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">{categoryName}</h1>
              <p className="text-sm text-gray-500 mt-1">Menampilkan {products.length} produk pakaian kategori {categoryName}</p>
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

      {/* Grid Katalog Produk */}
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
            <h3 className="text-lg font-bold text-gray-900">Belum Ada Produk {categoryName}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
              Produk untuk kategori {categoryName} belum tersedia di toko. Silakan lihat katalog produk lainnya.
            </p>
            <Link href="/produk" className="btn btn-primary text-xs px-4 py-2">Lihat Semua Produk</Link>
          </div>
        )}
      </div>
    </div>
  );
}
