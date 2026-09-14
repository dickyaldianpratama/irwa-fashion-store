
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  await prisma.itemPesanan.deleteMany();
  await prisma.pesanan.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.produk.deleteMany();
  await prisma.kategori.deleteMany();

  const kemeja = await prisma.kategori.create({
    data: { nama: 'Kemeja', slug: 'kemeja' }
  });
  const celana = await prisma.kategori.create({
    data: { nama: 'Celana', slug: 'celana' }
  });

  const p1 = await prisma.produk.create({
    data: {
      nama: 'Kemeja Linen Premium',
      slug: 'kemeja-linen-premium',
      deskripsi: 'Kemeja linen murni dengan potongan slim fit. Sangat nyaman untuk iklim tropis dan cocok digunakan untuk acara formal maupun santai.',
      bahanKain: 'Linen Premium',
      occasion: 'Smart Casual, Pakaian Kerja',
      hargaAsli: 299000,
      hargaDiskon: 249000,
      kategoriId: kemeja.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', isUtama: true },
          { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', isUtama: false }
        ]
      },
      varian: {
        create: [
          { warna: 'Navy Blue', ukuran: 'L', stok: 15, sku: 'KEM-LIN-NVY-L' },
          { warna: 'Olive Green', ukuran: 'L', stok: 8, sku: 'KEM-LIN-OLV-L' }
        ]
      }
    }
  });

  const p2 = await prisma.produk.create({
    data: {
      nama: 'Celana Chino Slim Fit',
      slug: 'celana-chino-slim-fit',
      deskripsi: 'Celana chino stretchable nyaman yang mengikuti bentuk kaki secara sempurna.',
      bahanKain: 'Cotton Twill',
      occasion: 'Casual, Hangout',
      hargaAsli: 350000,
      kategoriId: celana.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80', isUtama: true }
        ]
      },
      varian: {
        create: [
          { warna: 'Khaki', ukuran: '32', stok: 20, sku: 'CHN-KHK-32' },
          { warna: 'Hitam', ukuran: '32', stok: 12, sku: 'CHN-BLK-32' }
        ]
      }
    }
  });

  console.log('Seeding selesai!');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

