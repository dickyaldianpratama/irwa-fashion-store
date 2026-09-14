
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const kemeja = await prisma.kategori.findFirst({ where: { slug: 'kemeja' } });
  const celana = await prisma.kategori.findFirst({ where: { slug: 'celana' } });

  if (!kemeja || !celana) return;

  await prisma.produk.createMany({
    data: [
      {
        nama: 'Kemeja Flanel Kotak Premium',
        slug: 'kemeja-flanel-kotak-premium',
        deskripsi: 'Flanel tebal dan nyaman.',
        hargaAsli: 250000,
        hargaDiskon: 189000,
        kategoriId: kemeja.id,
        terjual: 340,
        rating: 4.8
      },
      {
        nama: 'Kaos Polos Basic 100% Katun Combed',
        slug: 'kaos-polos-katun-combed',
        deskripsi: 'Kaos katun combed 30s.',
        hargaAsli: 55000,
        kategoriId: kemeja.id,
        terjual: 1250,
        rating: 4.9
      },
      {
        id: 'p5', // override ID if needed, but uuid is fine
        nama: 'Jaket Denim Jeans Pria Vintage Wash',
        slug: 'jaket-denim-jeans-vintage',
        deskripsi: 'Jaket denim tebal.',
        hargaAsli: 245000,
        kategoriId: kemeja.id,
        terjual: 210,
        rating: 4.8
      }
    ]
  });

  console.log('Added more products!');
}
main().finally(() => prisma['']());

