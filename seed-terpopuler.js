const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.koleksiTerpopuler.deleteMany();
  
  await prisma.koleksiTerpopuler.createMany({
    data: [
      {
        title: 'Koleksi Kemeja Premium',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
        link: '/produk?kategori=kemeja',
        urutan: 1
      },
      {
        title: 'Celana Kasual',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
        link: '/produk?kategori=celana',
        urutan: 2
      },
      {
        title: 'Bestseller Musim Ini',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
        link: '/produk',
        urutan: 3
      }
    ]
  });
  console.log('Successfully seeded KoleksiTerpopuler');
}

main().catch(console.error).finally(() => prisma.$disconnect());
