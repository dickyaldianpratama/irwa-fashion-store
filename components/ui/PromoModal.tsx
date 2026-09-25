"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface BroadcastData {
  id: string;
  title: string;
  body: string;
  image?: string | null;
  url?: string | null;
  isModal?: boolean;
  couponCode?: string | null;
  discountTag?: string | null;
  createdAt?: string;
}

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [promo, setPromo] = useState<BroadcastData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLatestPromoModal = async () => {
      try {
        const res = await fetch("/api/notifikasi/latest-broadcast");
        const json = await res.json();
        const data: BroadcastData = json.data;

        if (data && data.id && (data.isModal ?? true)) {
          const dismissedId = localStorage.getItem("irwa_dismissed_promo_modal_id");
          if (dismissedId !== data.id) {
            setPromo(data);
            setIsOpen(true);
          }
        }
      } catch (err) {
        // silent
      }
    };

    fetchLatestPromoModal();
  }, []);

  if (!isOpen || !promo) return null;

  const handleClose = () => {
    if (promo?.id) {
      localStorage.setItem("irwa_dismissed_promo_modal_id", promo.id);
    }
    setIsOpen(false);
  };

  const handleClaim = () => {
    if (promo.couponCode) {
      navigator.clipboard.writeText(promo.couponCode);
      toast.success(`Kode kupon "${promo.couponCode}" berhasil disalin!`);
    }
    handleClose();
    window.location.href = promo.url || "/promo";
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (promo.couponCode) {
      navigator.clipboard.writeText(promo.couponCode);
      setCopied(true);
      toast.success(`Kode kupon "${promo.couponCode}" disalin!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const couponCode = promo.couponCode || "MEGASALE70";
  const discountTag = promo.discountTag || "DISKON HINGGA 70%";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in select-none">
      {/* Floating 3D Gold Coins & Confetti (Decorative) */}
      <div className="absolute top-12 left-8 sm:left-24 w-10 h-10 bg-amber-400 border-2 border-amber-200 rounded-full shadow-lg shadow-amber-500/40 flex items-center justify-center text-amber-950 font-black text-sm animate-bounce duration-1000">
        $
      </div>
      <div className="absolute bottom-20 right-8 sm:right-24 w-12 h-12 bg-amber-400 border-2 border-amber-200 rounded-full shadow-lg shadow-amber-500/40 flex items-center justify-center text-amber-950 font-black text-base animate-bounce duration-1000 delay-300">
        $
      </div>
      <div className="absolute top-1/4 right-12 w-7 h-7 bg-amber-300 border border-amber-100 rounded-full shadow-md flex items-center justify-center text-amber-950 font-bold text-xs animate-pulse">
        $
      </div>

      {/* Main Modal Wrapper */}
      <div className="relative max-w-md w-full flex flex-col items-center">
        {/* Top Header Title */}
        <h2 className="text-white text-lg sm:text-xl font-black tracking-wide text-center uppercase mb-3 drop-shadow-md">
          {promo.title || "NOTIFIKASI PESAN DISKON PROMO BESAR-BESARAN"}
        </h2>

        {/* Modal Card */}
        <div className="relative w-full bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-gray-100 flex flex-col items-center text-center overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100/80 hover:bg-gray-200 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup Notifikasi"
          >
            <X size={18} />
          </button>

          {/* Time indicator */}
          <span className="self-start text-[11px] font-medium text-gray-400 mb-1">
            Baru Saja
          </span>

          {/* 3D Illustration Megaphone / Custom Banner Image */}
          <div className="relative w-full max-w-[220px] aspect-[4/3] my-1 flex items-center justify-center">
            {promo.image ? (
              <img
                src={promo.image}
                alt="Banner Promo"
                className="w-full h-full object-contain drop-shadow-lg rounded-2xl"
              />
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/40 text-4xl transform hover:scale-105 transition-transform">
                  📣
                </div>
                <div className="absolute -bottom-1 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  Mega Sale
                </div>
              </div>
            )}
          </div>

          {/* Golden Highlight Tag Banner */}
          <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl p-3 my-3 shadow-md shadow-amber-400/20 text-amber-950 flex items-center justify-between gap-2 border border-amber-200">
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-950 text-amber-300 px-2 py-0.5 rounded-md inline-block mb-0.5">
                Mega Sale
              </span>
              <p className="text-xs sm:text-sm font-black tracking-tight uppercase">
                {discountTag}
              </p>
            </div>
            <div className="bg-amber-950 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0">
              PROMO KILAT
            </div>
          </div>

          {/* Description & Coupon Code */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1 my-1">
            {promo.body}
          </p>

          {/* Coupon Box (1-Click Copy) */}
          {couponCode && (
            <div
              onClick={handleCopyCoupon}
              className="w-full mt-2.5 mb-4 p-2.5 bg-gray-50 border-2 border-dashed border-sky-300 rounded-xl flex items-center justify-between cursor-pointer hover:bg-sky-50/60 transition-colors group"
            >
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-semibold block">
                  Gunakan Kode Saat Checkout:
                </span>
                <span className="font-mono text-sm font-black text-sky-600">
                  {couponCode}
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 bg-sky-500 group-hover:bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={handleClaim}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={16} />
              Ambil Diskon Sekarang
            </button>
            <button
              onClick={handleClose}
              className="py-3 px-4 bg-white border-2 border-sky-400 text-sky-600 hover:bg-sky-50 font-bold text-xs sm:text-sm rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              Tutup Notifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
