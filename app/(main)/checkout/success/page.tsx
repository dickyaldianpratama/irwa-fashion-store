"use client";

import Link from "next/link";
import { CheckCircle, QrCode, FileText, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "1";
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);
  
  // Format order ID singkat (ambil 8 karakter pertama untuk display)
  const shortOrderId = orderId === "1" ? "INV-20260913-001" : orderId.split("-")[0].toUpperCase();

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
      
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Terima kasih telah berbelanja di IRWA FASHION HOUSE. Pesananmu (<b>{shortOrderId}</b>) sedang kami siapkan.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <QrCode className="text-primary shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">Ambil di Toko (O2O)</h4>
            <p className="text-xs text-gray-500 mt-1">Tunjukkan QR Code yang kami kirimkan ke WhatsApp dan Email saat mengambil barang di PIM Jakarta Selatan.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
          <FileText className="text-primary shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">Invoice Otomatis</h4>
            <p className="text-xs text-gray-500 mt-1">Invoice berformat PDF telah terlampir otomatis di Email Anda.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`/akun/pesanan/${orderId}`} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex justify-center items-center gap-2">
          Lacak Pesanan
          <ArrowRight size={18} />
        </Link>
        <Link href="/" className="w-full py-3.5 bg-white text-gray-600 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-12">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
