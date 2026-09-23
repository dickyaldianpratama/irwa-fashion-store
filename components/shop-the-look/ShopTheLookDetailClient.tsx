"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, MessageCircle, Share2, Check } from "lucide-react";
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Parse external items from deskripsi if available
  const parseExternalItems = (desc: string | null) => {
    if (!desc) return { mainDesc: "", items: [] as { label: string; url: string }[] };

    let mainDesc = desc;
    const items: { label: string; url: string }[] = [];

    const match = desc.match(/\[Items: (.*?)\]/);
    if (match && match[1]) {
      mainDesc = desc.replace(/\[Items: .*?\]/, "").trim();
      const parts = match[1].split(" | ");
      parts.forEach((p) => {
        const [label, ...urlParts] = p.split(": ");
        if (label && urlParts.length > 0) {
          items.push({ label: label.trim(), url: urlParts.join(": ").trim() });
        }
      });
    }

    return { mainDesc, items };
  };

  const { mainDesc, items: externalItems } = parseExternalItems(look.deskripsi);

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
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-20 pt-6">
      <div className="container-app max-w-5xl mx-auto px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
            <span>{copied ? "Tersalin!" : "Bagikan Look"}</span>
          </button>
        </div>

        {/* Main Outfit Card Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Image Preview */}
          <div className="md:col-span-6 lg:col-span-5 relative bg-gray-100 dark:bg-gray-800 aspect-[4/5] md:aspect-auto min-h-[380px] overflow-hidden">
            {look.image ? (
              <Image
                src={look.image}
                alt={look.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <ShoppingBag size={48} className="mb-2 opacity-30" />
                <p className="text-sm font-semibold">Tidak ada gambar look</p>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              1 Set Outfit Premium
            </div>
          </div>

          {/* Right Column: Details & CTA */}
          <div className="md:col-span-6 lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 mb-2">
                  <Sparkles size={12} /> Special Styling Bundle
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  {look.title}
                </h1>
                {mainDesc && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {mainDesc}
                  </p>
                )}
              </div>

              {/* Price Box */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Total Harga 1 Paket Set Utuh
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                    {formatRupiah(look.totalHarga)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                    <ShieldCheck size={14} /> Garansi 100% Original
                  </span>
                </div>
              </div>

              {/* External Items / Links Section */}
              {(externalItems.length > 0 || (look.items && look.items.length > 0)) && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-primary" /> Item Termasuk dalam Paket Set Ini:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {externalItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {item.label}
                        </span>
                        {item.url && item.url.startsWith("http") && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 shrink-0"
                          >
                            Lihat <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}

                    {look.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-200">
                          {item.produk.images[0]?.url ? (
                            <img src={item.produk.images[0].url} alt={item.produk.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {item.produk.nama}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white font-bold text-base rounded-2xl flex justify-center items-center gap-2.5 transition-all shadow-lg shadow-primary/30 cursor-pointer disabled:opacity-70"
              >
                <ShoppingBag size={20} />
                {isAdding ? "Menambahkan..." : "Beli 1 Paket Set Sekarang"}
              </button>

              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin IRWA, saya berminat membeli 1 Set Outfit "${look.title}" dengan total harga ${formatRupiah(look.totalHarga)}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex justify-center items-center gap-2 transition-colors border border-emerald-200/60 dark:border-emerald-800/60 cursor-pointer"
              >
                <MessageCircle size={16} />
                Tanya Admin via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
