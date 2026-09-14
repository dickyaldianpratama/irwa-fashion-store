"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[500px] mx-auto">
      {/* Main Image Slider */}
      <div className="relative bg-gray-100 rounded-card overflow-hidden group">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex touch-pan-y cursor-grab active:cursor-grabbing">
            {images.map((src, index) => (
              <div key={index} className="relative flex-[0_0_100%] min-w-0 aspect-square max-h-[500px] lg:max-h-[600px] flex items-center justify-center bg-gray-50">
                <Image
                  src={src}
                  alt={`Foto produk ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover transition-transform duration-500 sm:group-hover:scale-150 sm:cursor-zoom-in origin-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows (Desktop Only) */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex hover:bg-white hover:text-primary"
          onClick={() => mainApi?.scrollPrev()}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex hover:bg-white hover:text-primary"
          onClick={() => mainApi?.scrollNext()}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="overflow-hidden" ref={thumbRef}>
        <div className="flex gap-2 sm:gap-3">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={cn(
                "relative flex-[0_0_22%] sm:flex-[0_0_20%] min-w-0 aspect-square rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
