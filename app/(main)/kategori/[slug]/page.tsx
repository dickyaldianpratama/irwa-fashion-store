import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowLeft, Layers, ShoppingBag, Star, MessageSquare, Tag, ShieldCheck } from "lucide-react";
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

  // Cari di KategoriPilihan (dengan Ulasan & Ratings) dan Kategori
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
      include: {
        ulasan: {
          orderBy: { createdAt: "desc" },
        },
        ratings: {
          orderBy: { createdAt: "desc" },
        },
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

  // Ambil SELURUH produk yang cocok di toko (case-insensitive search tanpa batasan take)
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

  // Cari seluruh produk toko yang mengandung kata kunci (misal: "celana")
  const matchingStoreProducts = await prisma.produk.findMany({
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
  matchingStoreProducts.forEach((p: any) => {
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

  // Cari Koleksi Terpopuler yang relevan
  const relatedKoleksi = await prisma.koleksiTerpopuler.findMany({
    where: {
      OR: [
        { title: { contains: categoryName, mode: "insensitive" } },
        { title: { contains: cleanName, mode: "insensitive" } },
        { title: { contains: decodedSlug, mode: "insensitive" } },
      ],
    },
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
              Kategori Pilihan
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium capitalize">
              {categoryName}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Banner Detail Kategori Pilihan */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-md">
                  Kategori Pilihan
                </span>
                {kategoriPilihanDb?.labelPromo && (
                  <span className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {kategoriPilihanDb.labelPromo}
                  </span>
                )}
                {kategoriPilihanDb?.rating && (
                  <span className="text-xs font-bold text-gray-900 bg-amber-400 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Star size={12} className="fill-gray-900" />
                    {kategoriPilihanDb.rating} / 5.0
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 capitalize tracking-tight">
                {categoryName}
              </h1>

              {/* Deskripsi & Detail Bahan */}
              {kategoriPilihanDb?.deskripsi && (
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-800">Detail & Bahan Kain: </span>
                  {kategoriPilihanDb.deskripsi}
                </p>
              )}

              {/* Harga & Promo */}
              {(kategoriPilihanDb?.hargaAsli || kategoriPilihanDb?.hargaDiskon) && (
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-xs text-gray-500 font-medium">Harga Spesial:</span>
                  {kategoriPilihanDb.hargaDiskon ? (
                    <>
                      <span className="text-xl font-black text-primary">
                        Rp {kategoriPilihanDb.hargaDiskon.toLocaleString("id-ID")}
                      </span>
                      {kategoriPilihanDb.hargaAsli && (
                        <span className="text-sm text-gray-400 line-through">
                          Rp {kategoriPilihanDb.hargaAsli.toLocaleString("id-ID")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xl font-black text-gray-900">
                      Rp {kategoriPilihanDb.hargaAsli?.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/kategori"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} /> Semua Kategori Pilihan
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-8 space-y-10">
        {/* Section Ulasan Customer jika ada */}
        {((kategoriPilihanDb?.ulasan && kategoriPilihanDb.ulasan.length > 0) || kategoriPilihanDb?.ulasanText) && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-primary" />
              Ulasan Customer untuk {categoryName}
            </h2>

            {kategoriPilihanDb?.ulasanText && (
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 mb-4">
                <p className="text-xs text-blue-900 font-semibold mb-1">Ulasan Utama:</p>
                <p className="text-sm text-gray-700 italic">&ldquo;{kategoriPilihanDb.ulasanText}&rdquo;</p>
              </div>
            )}

            {kategoriPilihanDb?.ulasan && kategoriPilihanDb.ulasan.length > 0 && (
              <div className="space-y-3">
                {kategoriPilihanDb.ulasan.map((u) => (
                  <div key={u.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-800">
                        {u.user?.name || "Customer Terverifikasi"}
                      </span>
                      <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                        <Star size={12} className="fill-amber-400" />
                        {u.rating}.0
                      </span>
                    </div>
                    {u.komentar && <p className="text-xs text-gray-600">{u.komentar}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Koleksi Terpopuler Terkait */}
        {relatedKoleksi.length > 0 && (
          <div>
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
              Koleksi untuk kategori {categoryName} sedang disiapkan. Silakan lihat koleksi kami yang lain.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/kategori" className="btn btn-primary text-xs px-4 py-2">
                Semua Kategori
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
