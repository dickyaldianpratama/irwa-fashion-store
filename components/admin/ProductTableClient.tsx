"use client";

import { useState } from "react";
import Image from "next/image";
import ProductTableActions from "@/components/admin/ProductTableActions";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

interface Product {
  id: string;
  nama: string;
  slug: string;
  kategori: { nama: string };
  images: { url: string }[];
  hargaAsli: number;
  hargaDiskon: number | null;
  varian?: { stok: number }[];
}

interface Props {
  products: Product[];
}

export default function ProductTableClient({ products }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await MySwal.fire({
      title: 'Hapus Terpilih?',
      html: `Apakah Anda yakin ingin menghapus <b>${selectedIds.length} produk</b> yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl dark:bg-gray-900 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (!result.isConfirmed) return;

    setIsDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/produk/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menghapus produk terpilih");

      toast.success(`${data.deletedCount} produk berhasil dihapus`);
      setSelectedIds([]);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      
      {/* Bulk Actions Header */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {selectedIds.length} produk dipilih
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeletingBulk}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isDeletingBulk ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus Terpilih
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Produk</th>
              <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Kategori</th>
              <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Harga</th>
              <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStok = p.varian ? p.varian.reduce((sum, v) => sum + v.stok, 0) : 0;
                const isSelected = selectedIds.includes(p.id);

                return (
                  <tr key={p.id} className={`transition-colors ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/20"}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleSelect(p.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                          {p.images && p.images[0]?.url ? (
                            <Image src={p.images[0].url} alt={p.nama} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{p.nama}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {p.kategori?.nama || "Umum"}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                      Rp {p.hargaDiskon ? p.hargaDiskon.toLocaleString("id-ID") : p.hargaAsli.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <ProductTableActions 
                        productId={p.id} 
                        productName={p.nama} 
                        totalStok={totalStok}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}