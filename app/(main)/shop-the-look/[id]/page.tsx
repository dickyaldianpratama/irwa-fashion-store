import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ShopTheLookDetailClient from "@/components/shop-the-look/ShopTheLookDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await prisma.shopTheLook.findUnique({
    where: { id },
  });

  if (!look) return { title: "Shop The Look | IRWA Store" };

  return {
    title: `${look.title} - Shop The Look | IRWA Store`,
    description: look.deskripsi || "Beli 1 Set Outfit Lengkap di IRWA Store",
  };
}

export default async function ShopTheLookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await prisma.shopTheLook.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          produk: {
            include: {
              images: { where: { isUtama: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!look) {
    notFound();
  }

  return <ShopTheLookDetailClient look={look} />;
}
