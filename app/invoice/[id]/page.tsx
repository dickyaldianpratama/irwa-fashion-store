"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/akun/pesanan/${params.id}`);
        if (res.ok) {
          const { data } = await res.json();
          setOrder(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (error) return <div className="p-8 text-center text-red-500 font-bold">Invoice tidak ditemukan.</div>;
  if (!order) return <div className="p-8 text-center animate-pulse">Memuat invoice...</div>;

  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.harga * item.qty), 0);
  const totalPengiriman = order.tipePengiriman === "PICKUP" ? 0 : 25000;
  const totalAlterasi = order.tipePengiriman === "ALTERATION" ? 35000 : 0;
  const grandTotal = order.totalHarga;
  const diskon = (subtotal + totalPengiriman + totalAlterasi) - grandTotal;

  const orderDate = new Date();
  const formattedDate = order.tanggal || orderDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-[800px] mx-auto p-4 sm:p-8 md:p-12 bg-white text-black font-sans print-container overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-6 sm:gap-0">
        <div className="relative inline-block w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-3xl sm:text-[40px] font-black uppercase tracking-widest leading-none">INVOICE</h1>
          <div className="w-full h-[3px] bg-black mt-2"></div>
          
          {/* LUNAS Stamp */}
          {(order.status === "PAID" || order.status === "DELIVERED") && (
            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-24 transform rotate-12 w-28 h-28 sm:w-40 sm:h-40 opacity-90 mix-blend-multiply pointer-events-none z-50">
              <Image 
                src="/images/stempel.png" 
                alt="Stempel Lunas" 
                fill 
                className="object-contain" 
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-row-reverse sm:flex-row items-center justify-center sm:justify-end gap-4 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-black">IRWA FASHION</h2>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Fashion Terlengkap</p>
          </div>
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0">
            <Image 
              src="/images/irwa-logo.png" 
              alt="Logo" 
              fill 
              sizes="(max-width: 640px) 64px, 96px"
              priority
              className="object-contain scale-[1.2]"
            />
          </div>
        </div>
      </div>
      
      <div className="w-full h-[1px] bg-gray-400 mb-8"></div>

      {/* Info KEPADA, TANGGAL, NO INVOICE */}
      <div className="flex flex-col sm:flex-row justify-between mb-8 sm:mb-10 text-xs sm:text-sm gap-6 sm:gap-0">
        <div className="w-full sm:w-1/2">
          <h3 className="font-bold uppercase mb-1">KEPADA :</h3>
          <p className="text-black font-bold uppercase">{order.user?.name || "Pelanggan Setia"}</p>
          <p className="text-black whitespace-pre-wrap mt-0.5 break-words pr-4">
            {order.tipePengiriman === "PICKUP" ? "O2O PICKUP DI TOKO" : (order.alamatPengiriman || "-")}
          </p>
        </div>
        <div className="w-full sm:w-1/2 text-left sm:text-right">
          <h3 className="font-bold uppercase mb-1">TANGGAL :</h3>
          <p className="text-black mb-4">{formattedDate}</p>

          <h3 className="font-bold uppercase mb-1">NO INVOICE :</h3>
          <p className="text-black tracking-wider break-all">{order.id.split("-")[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="mb-8 sm:mb-10 overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[500px] px-4 sm:px-0">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-bold text-black uppercase w-[45%]">KETERANGAN</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-bold text-black uppercase">HARGA</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center font-bold text-black uppercase">JML</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-bold text-black uppercase">TOTAL</th>
              </tr>
            </thead>
            <tbody className="bg-[#f0f0f0]">
              {order.items.map((item: any, index: number) => (
                <tr key={item.id} className={index !== order.items.length - 1 ? "border-b border-gray-300" : ""}>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                    <p className="font-medium text-black uppercase">{item.nama}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 uppercase">{item.warna} - {item.ukuran}</p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-left font-medium text-black uppercase">
                    RP {item.harga?.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-center font-medium text-black">
                    {item.qty}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-medium text-black uppercase">
                    RP {(item.qty * item.harga)?.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary / Pembayaran */}
      <div className="flex flex-col-reverse sm:flex-row justify-between text-xs sm:text-sm mb-12 sm:mb-16 gap-8 sm:gap-0">
        <div className="w-full sm:w-1/2">
          <h3 className="font-bold text-black uppercase mb-2">PEMBAYARAN :</h3>
          <p className="text-black font-bold uppercase">Metode : {order.metodePembayaran ? order.metodePembayaran.replace(/_/g, ' ') : "TRANSFER"}</p>
          <p className="text-black font-bold uppercase">Status : {order.status === 'PAID' || order.status === 'DELIVERED' ? 'LUNAS (PAID)' : order.status}</p>
        </div>
        
        <div className="w-full sm:w-[300px]">
          <div className="flex justify-between py-1 uppercase text-black font-medium">
            <span>Subtotal :</span>
            <span>RP {subtotal.toLocaleString("id-ID")}</span>
          </div>
          
          {totalPengiriman > 0 && (
            <div className="flex justify-between py-1 uppercase text-black font-medium">
              <span>Pengiriman :</span>
              <span>RP {totalPengiriman.toLocaleString("id-ID")}</span>
            </div>
          )}

          {totalAlterasi > 0 && (
            <div className="flex justify-between py-1 uppercase text-black font-medium">
              <span>Alterasi :</span>
              <span>RP {totalAlterasi.toLocaleString("id-ID")}</span>
            </div>
          )}

          {diskon > 0 && (
            <div className="flex justify-between py-1 uppercase text-red-600 font-medium">
              <span>Diskon :</span>
              <span>- RP {diskon.toLocaleString("id-ID")}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 mt-2 uppercase text-black font-bold border-t border-black text-sm sm:text-base">
            <span>TOTAL :</span>
            <span>RP {grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="flex justify-end">
        <div className="flex flex-col items-center">
          <p className="text-black font-medium text-xs sm:text-sm mb-2">Hormat Kami,</p>
          <div className="w-40 h-20 sm:w-48 sm:h-24 relative mb-2 mix-blend-multiply">
            <Image 
              src="/images/ttd.png" 
              alt="Tanda Tangan" 
              fill 
              sizes="(max-width: 640px) 160px, 192px"
              className="object-contain" 
            />
          </div>
          <div className="border-t border-black pt-1 w-40 sm:w-56 text-center">
            <p className="font-bold text-black text-[10px] sm:text-sm">Management IRWA Fashion</p>
          </div>
        </div>
      </div>

      {/* CSS Khusus Print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          nav, header, footer, .hide-on-print { display: none !important; }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />

      {/* Tombol Print/Download untuk Mobile & Desktop */}
      <div className="fixed bottom-6 right-6 hide-on-print z-50">
        <button 
          onClick={() => window.print()} 
          className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </button>
      </div>

    </div>
  );
}
