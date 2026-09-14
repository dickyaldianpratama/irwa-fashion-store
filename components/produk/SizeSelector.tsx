"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Ruler, CheckCircle2, X } from "lucide-react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelect: (size: string) => void;
  recommendedSize?: string;
}

export default function SizeSelector({ sizes, selectedSize, onSelect, recommendedSize }: SizeSelectorProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="space-y-3 relative">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">Pilih Ukuran</span>
          {recommendedSize && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-200">
              <CheckCircle2 size={12} />
              Cocok: {recommendedSize}
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
        >
          <Ruler size={16} />
          Panduan Ukuran
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isRecommended = recommendedSize === size;

          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              className={cn(
                "relative min-w-[3rem] h-12 px-4 rounded-xl border flex items-center justify-center text-sm font-semibold transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50"
              )}
            >
              {size}
              
              {isRecommended && !isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
      
      {!recommendedSize && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mt-4 text-sm text-gray-600 flex items-start gap-2">
          <span className="text-lg">💡</span>
          <p>
            Ragu dengan ukuranmu? <button className="font-semibold text-primary hover:underline">Isi profil ukuran (Save My Size)</button> agar kami bisa merekomendasikan ukuran yang paling pas untuk badanmu.
          </p>
        </div>
      )}

      {/* Modal Panduan Ukuran */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Ruler size={20} className="text-primary" />
                Panduan Ukuran (Kemeja)
              </h3>
              <button onClick={() => setIsGuideOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <p className="text-sm text-gray-600 mb-4">
                Gunakan tabel ini sebagai panduan untuk menemukan ukuran yang pas untuk Anda. Semua dimensi diukur dalam centimeter (cm).
              </p>
              
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Lebar Dada</th>
                      <th className="px-4 py-3">Panjang Baju</th>
                      <th className="px-4 py-3">Panjang Lengan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">S</td>
                      <td className="px-4 py-3">50 cm</td>
                      <td className="px-4 py-3">70 cm</td>
                      <td className="px-4 py-3">59 cm</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">M</td>
                      <td className="px-4 py-3">52 cm</td>
                      <td className="px-4 py-3">72 cm</td>
                      <td className="px-4 py-3">60 cm</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors bg-green-50/30">
                      <td className="px-4 py-3 font-bold text-primary">L <span className="text-[10px] font-normal text-green-600 ml-1">(Rata-rata)</span></td>
                      <td className="px-4 py-3">54 cm</td>
                      <td className="px-4 py-3">74 cm</td>
                      <td className="px-4 py-3">61 cm</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">XL</td>
                      <td className="px-4 py-3">56 cm</td>
                      <td className="px-4 py-3">76 cm</td>
                      <td className="px-4 py-3">62 cm</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">XXL</td>
                      <td className="px-4 py-3">58 cm</td>
                      <td className="px-4 py-3">78 cm</td>
                      <td className="px-4 py-3">63 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex flex-col gap-1 leading-relaxed">
                <p><strong>Lebar Dada:</strong> Diukur dari jahitan ketiak kiri ke ketiak kanan.</p>
                <p><strong>Panjang Baju:</strong> Diukur dari titik bahu tertinggi hingga ujung bawah baju.</p>
                <p className="text-gray-500 italic mt-1">* Toleransi perbedaan ukuran 1-2 cm karena proses potong/jahit.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
