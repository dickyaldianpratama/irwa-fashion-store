"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Share2,
  Check,
  Shirt,
  Glasses,
  Footprints,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";

interface LookItem {
  id: string;
  produkId: string;
  produk: {
    nama: string;
    hargaAsli: number;
    hargaDiskon: number | null;
    images: { url: string }[];
  };
}

interface Look {
  id: string;
  title: string;
  deskripsi: string | null;
  image: string;
  totalHarga: number;
  items?: LookItem[];
}

interface Props {
  look: Look;
}

export default function ShopTheLookDetailClient({ look }: Props) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(look.image);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Parse external items from deskripsi if available
  const parseExternalItems = (desc: string | null) => {
    if (!desc) return { mainDesc: "", items: [] as { label: string; url: string }[], itemsMap: {} as Record<string, string> };

    let mainDesc = desc;
    const itemsMap: Record<string, string> = {};
    const items: { label: string; url: string }[] = [];

    const match = desc.match(/\[Items: (.*?)\]/);
    if (match && match[1]) {
      mainDesc = desc.replace(/\[Items: .*?\]/, "").trim();
      const parts = match[1].split(" | ");
      parts.forEach((p) => {
        const [label, ...urlParts] = p.split(": ");
        if (label && urlParts.length > 0) {
          const url = urlParts.join(": ").trim();
          const cleanLabel = label.trim();
          itemsMap[cleanLabel] = url;
          items.push({ label: cleanLabel, url });
        }
      });
    }

    return { mainDesc, items, itemsMap };
  };

  const { mainDesc, items: externalItems, itemsMap } = parseExternalItems(look.deskripsi);

  // 5 standard categories with icon definitions
  const slots = [
    { key: "Baju", label: "Baju", icon: Shirt, url: itemsMap["Baju"] || "" },
    { key: "Celana", label: "Celana", icon: Shirt, url: itemsMap["Celana"] || "" },
    { key: "Aksesori", label: "Aksesori", icon: Glasses, url: itemsMap["Aksesori"] || "" },
    { key: "Sepatu", label: "Sepatu", icon: Footprints, url: itemsMap["Sepatu"] || "" },
    { key: "Topi", label: "Topi", icon: Sparkles, url: itemsMap["Topi"] || "" },
  ];

  // Build grid thumbnail items (5 slots)
  const itemThumbnails = externalItems.length > 0
    ? slots.map((slot) => ({
        id: slot.key,
        label: slot.label,
        icon: slot.icon,
        url: slot.url && slot.url.startsWith("http") ? slot.url : null,
        rawText: slot.url,
      }))
    : (look.items || []).map((it, idx) => ({
        id: it.id || `db-${idx}`,
        label: it.produk.nama,
        icon: Shirt,
        url: it.produk.images[0]?.url || null,
        rawText: "",
      }));

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: look.id,
      nama: `[Paket Set] ${look.title}`,
      harga: look.totalHarga,
      gambar: look.image || "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600",
      ukuran: "1 Set Lengkap",
      warna: "Bundling Outfit",
      jumlah: 1,
    });

    toast.success("1 Paket Set Outfit berhasil ditambahkan ke keranjang!");
    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link outfit disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-16 pt-4 sm:pt-6 select-none">
      <div className="container-app max-w-4xl mx-auto px-3 sm:px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            <span>{copied ? "Tersalin!" : "Bagikan"}</span>
          </button>
        </div>

        {/* Compact & Clean Outfit Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Compact Main Image Preview & 5 Thumbnail Grid */}
          <div className="md:col-span-5 p-3 sm:p-4 bg-gray-50/70 dark:bg-gray-800/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            {/* Main Image Box */}
            <div className="relative w-full h-48 sm:h-60 md:h-auto md:aspect-[4/5] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-xs">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={look.title}
                  fill
                  className="object-cover transition-all duration-300"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <ShoppingBag size={36} className="mb-1 opacity-30" />
                  <p className="text-xs font-semibold">Tidak ada gambar look</p>
                </div>
              )}

              {/* Badge Overlay */}
              <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                1 Set Outfit Utuh
              </div>

              {/* Reset to Main Look Image Button */}
              {activeImage !== look.image && (
                <button
                  onClick={() => setActiveImage(look.image)}
                  className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs transition-all shadow-md z-10 cursor-pointer"
                >
                  <RotateCcw size={12} /> Gambar Utama
                </button>
              )}
            </div>

            {/* Grid Kotak-Kotak Kecil (5 Item Set) */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Item Set Outfit (5 Item)
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                  Klik untuk preview
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {itemThumbnails.map((item, idx) => {
                  const IconComponent = item.icon;
                  const isSelected = activeImage === item.url && item.url !== null;
                  const hasImage = !!item.url;

                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => {
                        if (item.url) setActiveImage(item.url);
                      }}
                      disabled={!hasImage}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center p-1 text-center group cursor-pointer ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 scale-[1.03] shadow-sm bg-white dark:bg-gray-900"
                          : hasImage
                          ? "border-gray-200 dark:border-gray-700/80 hover:border-primary/60 bg-white dark:bg-gray-900"
                          : "border-gray-200/60 dark:border-gray-800 bg-gray-100/70 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                      }`}
                      title={hasImage ? `Preview ${item.label}` : `${item.label} (Tidak ada gambar)`}
                    >
                      {hasImage ? (
                        <Image
                          src={item.url!}
                          alt={item.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-gray-400 dark:text-gray-500">
                          <IconComponent size={14} className="mb-0.5 opacity-60" />
                        </div>
                      )}

                      {/* Sub-label overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent py-0.5 px-0.5 z-10">
                        <p className="text-[9px] font-bold text-white truncate text-center leading-tight">
                          {item.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Action Controls */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 mb-1.5">
                  <Sparkles size={11} /> Stylist Outfit Set
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                  {look.title}
                </h1>
                {mainDesc && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed line-clamp-3">
                    {mainDesc}
                  </p>
                )}
              </div>

              {/* Price Box */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Total Harga Paket Set
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                    {formatRupiah(look.totalHarga)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck size={12} /> 100% Original
                  </span>
                </div>
              </div>

              {/* External Items Chips / Links Section */}
              {(externalItems.length > 0 || (look.items && look.items.length > 0)) && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rincian Item Set ({externalItems.length || look.items?.length || 0}):
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {externalItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200/80 dark:border-gray-700/80 flex items-center gap-1.5"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                          {item.label}
                        </span>
                        {item.url && item.url.startsWith("http") && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold text-[10px] flex items-center gap-0.5 shrink-0"
                          >
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}

                    {look.items?.map((item) => (
                      <div
                        key={item.id}
                        className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200/80 dark:border-gray-700/80 flex items-center gap-1.5"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                          {item.produk.nama}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-3 px-5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-70"
              >
                <ShoppingBag size={18} />
                {isAdding ? "Menambahkan..." : "Beli 1 Paket Set Sekarang"}
              </button>

              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin IRWA, saya berminat membeli 1 Set Outfit "${look.title}" dengan total harga ${formatRupiah(look.totalHarga)}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex justify-center items-center gap-1.5 transition-colors border border-emerald-200/60 dark:border-emerald-800/60 cursor-pointer"
              >
                <MessageCircle size={14} />
                Tanya Admin via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
