const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.kategoriPilihan.deleteMany();
  await prisma.shopTheLookItem.deleteMany();
  await prisma.shopTheLook.deleteMany();

  // Kategori Pilihan
  await prisma.kategoriPilihan.createMany({
    data: [
      {
        nama: 'Kemeja',
        slug: 'kemeja',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80'
      },
      {
        nama: 'Celana',
        slug: 'celana',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80'
      },
      {
        nama: 'Aksesoris',
        slug: 'aksesoris',
        image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&q=80'
      }
    ]
  });

  // Ambil produk yang sudah ada untuk Shop The Look
  const produk1 = await prisma.produk.findFirst({ where: { slug: 'kemeja-linen-premium' } });
  const produk2 = await prisma.produk.findFirst({ where: { slug: 'celana-chino-slim-fit' } });

  if (produk1 && produk2) {
    const total = produk1.hargaAsli + produk2.hargaAsli;
    // Set ShopTheLook
    const stl = await prisma.shopTheLook.create({
      data: {
        title: 'Smart Casual Weekend',
        deskripsi: 'Tampil rapi namun tetap santai dengan paduan kemeja linen premium dan celana chino.',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
        totalHarga: total - 50000, // Diskon bundling
        items: {
          create: [
            { produkId: produk1.id },
            { produkId: produk2.id }
          ]
        }
      }
    });
  }
  
  console.log('Successfully seeded KategoriPilihan and ShopTheLook');
}

main().catch(console.error).finally(() => prisma.$disconnect());
