"use client";

import { useEffect, useState } from "react";
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
          // Tunggu render & load gambar selesai baru diprint
          setTimeout(() => {
            window.print();
          }, 800);
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

  // Format tanggal (contoh: "Senin, 28 Maret 2022")
  const orderDate = new Date(); // Fallback jika tidak ada
  const formattedDate = order.tanggal || orderDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-[800px] mx-auto p-12 bg-white text-black font-sans print-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[40px] font-black uppercase tracking-widest leading-none">INVOICE</h1>
          <div className="w-full h-[3px] bg-black mt-2"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-widest text-black">IRWA FASHION</h2>
            <p className="text-sm font-medium text-gray-700">Fashion Terlengkap</p>
          </div>
          <div className="relative w-24 h-24 shrink-0">
            <Image 
              src="/images/irwa-logo.png" 
              alt="Logo" 
              fill 
              sizes="96px"
              priority
              className="object-contain scale-[1.2]"
            />
          </div>
        </div>
      </div>
      
      {/* Garis Horizontal Pembatas Header */}
      <div className="w-full h-[1px] bg-gray-400 mb-8"></div>

      {/* Info KEPADA, TANGGAL, NO INVOICE */}
      <div className="flex justify-between mb-10 text-sm">
        <div>
          <h3 className="font-bold uppercase mb-1">KEPADA :</h3>
          <p className="text-black font-bold uppercase">{order.user?.name || "Pelanggan Setia"}</p>
          <p className="text-black whitespace-pre-wrap mt-0.5">
            {order.tipePengiriman === "PICKUP" ? "O2O PICKUP DI TOKO" : (order.alamatPengiriman || "-")}
          </p>
          
        </div>
        <div className="text-right">
          <h3 className="font-bold uppercase mb-1">TANGGAL :</h3>
          <p className="text-black mb-4">{formattedDate}</p>

          <h3 className="font-bold uppercase mb-1">NO INVOICE :</h3>
          <p className="text-black tracking-wider">{order.id.split("-")[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-bold text-black uppercase w-[45%]">KETERANGAN</th>
              <th className="py-3 px-4 text-left font-bold text-black uppercase">HARGA</th>
              <th className="py-3 px-4 text-center font-bold text-black uppercase">JML</th>
              <th className="py-3 px-4 text-right font-bold text-black uppercase">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-[#f0f0f0]">
            {order.items.map((item: any, index: number) => (
              <tr key={item.id} className={index !== order.items.length - 1 ? "border-b border-gray-300" : ""}>
                <td className="py-4 px-4 text-left">
                  <p className="font-medium text-black uppercase">{item.nama}</p>
                  <p className="text-xs text-gray-600 mt-1 uppercase">{item.warna} - {item.ukuran}</p>
                </td>
                <td className="py-4 px-4 text-left font-medium text-black uppercase">
                  RP {item.harga?.toLocaleString("id-ID")}
                </td>
                <td className="py-4 px-4 text-center font-medium text-black">
                  {item.qty}
                </td>
                <td className="py-4 px-4 text-right font-medium text-black uppercase">
                  RP {(item.qty * item.harga)?.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary / Pembayaran */}
      <div className="flex justify-between text-sm mb-16">
        <div>
          <h3 className="font-bold text-black uppercase mb-2">PEMBAYARAN :</h3>
          <p className="text-black">Metode : {order.metodePembayaran || "Transfer"}</p>
          <p className="text-black">Status : {order.status}</p>
        </div>
        <div className="w-[300px]">
          <div className="flex justify-between py-1 uppercase text-black font-medium">
            <span>SUB TOTAL :</span>
            <span>RP {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between py-1 uppercase text-black font-medium">
            <span>PENGIRIMAN :</span>
            <span>RP {totalPengiriman.toLocaleString("id-ID")}</span>
          </div>
          {totalAlterasi > 0 && (
            <div className="flex justify-between py-1 uppercase text-black font-medium">
              <span>ALTERASI :</span>
              <span>RP {totalAlterasi.toLocaleString("id-ID")}</span>
            </div>
          )}
          {diskon > 0 && (
            <div className="flex justify-between py-1 uppercase text-black font-medium">
              <span>DISKON VOUCHER :</span>
              <span>-RP {diskon.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 mt-2 uppercase text-black font-bold border-t border-black">
            <span>TOTAL :</span>
            <span>RP {grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Footer / Tanda Tangan */}
      <div className="flex justify-between items-end mt-16 pt-8">
        <div className="w-1/2">
          <h3 className="font-bold text-black uppercase text-xl leading-snug">
            TERIMAKASIH ATAS<br />PEMBELIAN ANDA
          </h3>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="relative w-48 h-24 mb-2 mix-blend-multiply">
            <Image 
              src="/images/ttd.png" 
              alt="Tanda Tangan" 
              fill 
              sizes="192px"
              className="object-contain"
            />
          </div>
          <div className="border-t border-black pt-1 w-56 text-center">
            <p className="font-bold text-black text-sm">Management IRWA Fashion</p>
          </div>
        </div>
      </div>

      {/* Style khusus Print agar warna tidak hilang */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
          }
          nav, header, footer, .hide-on-print { display: none !important; }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
