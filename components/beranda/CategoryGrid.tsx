"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

interface KategoriItem {
  id: string;
  nama: string;
  slug: string;
  image: string | null;
}

interface Props {
  kategori: KategoriItem[];
}

export default function CategoryGrid({ kategori }: Props) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  });

  if (kategori.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container-app">
        <h2 className="section-title">Kategori Pilihan</h2>

        {/* Embla Viewport */}
        <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6 touch-pan-y py-2 cursor-grab active:cursor-grabbing">
            {kategori.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group flex-[0_0_28%] sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-1 flex flex-col items-center gap-3 select-none"
                draggable={false}
              >
                <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-square rounded-full sm:rounded-[16px] overflow-hidden bg-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md border border-gray-100">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.nama}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 30vw, 15vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                      {cat.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center group-hover:text-primary transition-colors">
                  {cat.nama}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}