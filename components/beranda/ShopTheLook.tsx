"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data outfit set
const dummyLooks = [
  {
    id: "l1",
    title: "Smart Casual Office",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
    totalPrice: 450000,
    items: ["Kemeja Oxford", "Celana Chino Slim", "Tote Bag Kanvas"],
  },
  {
    id: "l2",
    title: "Weekend Getaway",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&auto=format&fit=crop",
    totalPrice: 285000,
    items: ["Kaos Oversize", "Celana Pendek", "Topi Baseball"],
  },
  {
    id: "l3",
    title: "Formal Wedding",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
    totalPrice: 1250000,
    items: ["Setelan Jas Navy", "Kemeja Putih", "Dasi Sutra"],
  },
  {
    id: "l4",
    title: "Streetwear Edgy",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
    totalPrice: 560000,
    items: ["Jaket Denim", "Kaos Hitam", "Celana Cargo"],
  },
];

export default function ShopTheLook() {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

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
            {dummyLooks.map((look) => (
              <div
                key={look.id}
                className="group relative flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 rounded-card overflow-hidden bg-gray-100 shadow-sm border border-gray-100 select-none"
              >
                {/* Foto Look */}
                <div className="relative w-full aspect-[3/4] bg-gray-200 overflow-hidden">
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
                  />
                  {/* Overlay gradien bawah */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Tombol Aksi Kaca */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white hover:bg-white hover:text-primary transition-colors cursor-pointer shadow-lg z-10">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                {/* Konten Teks di Atas Gambar */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                  <h3 className="font-heading font-bold text-lg sm:text-xl mb-1">{look.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3 flex items-center gap-1.5 flex-wrap">
                    {look.items.map((item, idx) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        {item} {idx !== look.items.length - 1 && <span className="w-1 h-1 bg-gray-400 rounded-full"></span>}
                      </span>
                    ))}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-lg text-white">
                      {formatRp(look.totalPrice)}
                    </span>
                    <Link
                      href={`/shop-the-look/${look.id}`}
                      className="text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-pill transition-colors flex items-center gap-1"
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
