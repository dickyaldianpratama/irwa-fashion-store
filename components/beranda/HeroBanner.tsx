"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1200",
    title: "PROMO EKSTRA CASHBACK",
    subtitle: "Syarat & Ketentuan Berlaku",
    badge: "Hot Promo",
    cta: "Lihat Promo",
    href: "/promo",
    align: "left", // Posisi teks
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=80&w=1200",
    title: "KOLEKSI SETELAN JAS",
    subtitle: "Tampil elegan untuk momen penting Anda",
    badge: "New Arrival",
    cta: "Belanja Sekarang",
    href: "/kategori/jas",
    align: "center",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1200&auto=format&fit=crop",
    title: "KEMEJA KUALITAS TERBAIK",
    subtitle: "Ukuran tidak pas? Gratis tukar ukuran!",
    badge: "Garansi 100%",
    cta: "Lihat Kemeja",
    href: "/kategori/kemeja",
    align: "right",
  }
];

export default function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full max-w-[1440px] mx-auto group">
      {/* Viewport Slider */}
      <div className="overflow-hidden bg-gray-100" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 h-[220px] sm:h-[320px] md:h-[400px] lg:h-[480px]"
            >
              {/* Gambar Background */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slide.id === 1}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1440px"
              />
              {/* Overlay Hitam Transparan */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Konten Teks */}
              <div className="absolute inset-0 container-app flex flex-col justify-center">
                <div
                  className={cn(
                    "max-w-xl text-white space-y-2 sm:space-y-4 animate-fade-in",
                    slide.align === "center" ? "mx-auto text-center" : 
                    slide.align === "right" ? "ml-auto text-right" : "text-left"
                  )}
                >
                  <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-pill uppercase tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-bold leading-tight text-white drop-shadow-md">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-white/90 drop-shadow">
                    {slide.subtitle}
                  </p>
                  <div className={cn("pt-2", slide.align === "center" && "flex justify-center")}>
                    <Link
                      href={slide.href}
                      className="btn bg-white text-gray-900 hover:bg-gray-100 px-6 py-2.5 sm:px-8 sm:py-3"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigasi Panah (muncul saat hover di desktop) */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-primary rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-primary rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              selectedIndex === index ? "w-6 bg-primary" : "bg-white/50 hover:bg-white"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
