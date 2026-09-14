"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

const categories = [
  {
    id: "kemeja",
    name: "Kemeja",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/kemeja",
  },
  {
    id: "kaos",
    name: "Kaos & Polo",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/kaos",
  },
  {
    id: "celana",
    name: "Celana",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/celana",
  },
  {
    id: "jaket",
    name: "Jaket & Outer",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/jaket",
  },
  {
    id: "jas",
    name: "Setelan Jas",
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/jas",
  },
  {
    id: "aksesoris",
    name: "Aksesoris",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=300&auto=format&fit=crop",
    href: "/kategori/aksesoris",
  },
];

export default function CategoryGrid() {
  // Menggunakan dragFree agar geseran terasa alami seperti scroll biasa
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  });

  return (
    <section className="py-8 bg-white">
      <div className="container-app">
        <h2 className="section-title">Kategori Pilihan</h2>
        
        {/* Embla Viewport */}
        <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6 touch-pan-y py-2 cursor-grab active:cursor-grabbing">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex-[0_0_28%] sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-1 flex flex-col items-center gap-3 select-none"
                draggable={false}
              >
                <div className="relative w-20 h-20 sm:w-full sm:h-auto sm:aspect-[4/5] rounded-full sm:rounded-[12px] overflow-hidden bg-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md border border-gray-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                    sizes="(max-width: 640px) 80px, (max-width: 1024px) 30vw, 15vw"
                  />
                </div>
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
