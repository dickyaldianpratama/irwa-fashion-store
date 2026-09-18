"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface LookItem {
  id: string;
  produkId: string;
  produk: { nama: string };
}

interface Look {
  id: string;
  title: string;
  deskripsi: string | null;
  image: string;
  totalHarga: number;
  items: LookItem[];
}

interface Props {
  looks: Look[];
}

export default function ShopTheLook({ looks }: Props) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  if (looks.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container-app">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-primary-light text-primary text-xs font-bold rounded-pill uppercase tracking-wider mb-2">
              Inspirasi Gaya
            </span>
            <h2 className="section-title !mb-2 text-2xl sm:text-3xl">Shop The Look</h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Beli 1 set outfit lengkap pilihan fashion stylist kami. Lebih praktis, harga lebih hemat.
            </p>
          </div>
          <Link href="/shop-the-look" className="btn btn-secondary text-sm self-start md:self-auto shrink-0">
            Lihat Semua Gaya
          </Link>
        </div>

        {/* Embla Slider */}
        <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6 touch-pan-y py-2 cursor-grab active:cursor-grabbing">
            {looks.map((look) => (
              <div
                key={look.id}
                className="group relative flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_25%] min-w-0 rounded-card overflow-hidden bg-gray-100 shadow-sm border border-gray-100 select-none"
              >
                {/* Foto Look */}
                <div className="relative w-full aspect-[4/5] bg-gray-200 overflow-hidden">
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                    sizes="(max-width: 640px) 70vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                    unoptimized
                  />
                  {/* Overlay gradien bawah */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Tombol Aksi Kaca */}
                  <div className="absolute top-4 right-4 bg-primary text-white hover:bg-white hover:text-primary transition-colors cursor-pointer shadow-lg z-10 rounded-full p-2">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                {/* Konten Teks di Atas Gambar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="font-heading font-bold text-base sm:text-lg mb-0.5">{look.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-300 mb-2 flex items-center gap-1.5 flex-wrap">
                    {look.items.map((item, idx) => (
                      <span key={item.id} className="flex items-center gap-1.5">
                        {item.produk.nama}
                        {idx !== look.items.length - 1 && <span className="w-1 h-1 bg-gray-400 rounded-full" />}
                      </span>
                    ))}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-sm sm:text-base text-white">
                      {formatRp(look.totalHarga)}
                    </span>
                    <Link
                      href={`/shop-the-look/${look.id}`}
                      className="text-[11px] sm:text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-pill transition-colors flex items-center gap-1"
                    >
                      Beli Set <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}