import HeroBanner from "@/components/beranda/HeroBanner";
import CategoryGrid from "@/components/beranda/CategoryGrid";
import ProductCard, { ProductType } from "@/components/produk/ProductCard";
import ShopTheLook from "@/components/beranda/ShopTheLook";
import KoleksiTerpopulerList from "@/components/beranda/KoleksiTerpopulerList";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  // Fetch semua data secara paralel
  const [koleksiTerpopuler, kategoriPilihan, looks] = await Promise.all([
    // Koleksi Terpopuler Standalone
    prisma.koleksiTerpopuler.findMany({
      orderBy: { urutan: "asc" },
      take: 10,
    }),
    // Kategori Pilihan Standalone
    prisma.kategoriPilihan.findMany({ orderBy: { nama: "asc" } }),
    // Shop The Look dari database
    prisma.shopTheLook.findMany({
      include: {
        items: {
          include: {
            produk: {
              include: { images: { where: { isUtama: true }, take: 1 } }
            }
          }
        }
      },
      orderBy: { id: "desc" },
      take: 6,
    }),
  ]);

  return (
    <>
      <HeroBanner />
      <CategoryGrid kategori={kategoriPilihan} />

      <KoleksiTerpopulerList items={koleksiTerpopuler} />

      <ShopTheLook looks={looks} />
    </>
  );
}