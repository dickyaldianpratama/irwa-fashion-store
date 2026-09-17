"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2, PowerOff } from "lucide-react";
import toast from "react-hot-toast";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface Props {
  productId: string;
  productName: string;
  totalStok: number;
}

export default function ProductTableActions({ productId, productName, totalStok }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    const result = await MySwal.fire({
      title: 'Nonaktifkan Produk?',
      html: `Apakah Anda yakin ingin menonaktifkan <b>${productName}</b>?<br/><br/><span class="text-sm">Ini akan mengubah stok semua warna & ukuran menjadi 0 agar tidak bisa dibeli lagi.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Nonaktifkan!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl dark:bg-gray-900 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (!result.isConfirmed) return;

    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/admin/produk/${productId}/deactivate`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menonaktifkan produk");
      }

      toast.success("Produk berhasil dinonaktifkan (stok 0)");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: 'Hapus Produk?',
      html: `Apakah Anda yakin ingin menghapus <b>${productName}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl dark:bg-gray-900 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/produk/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus produk");
      }

      toast.success("Produk berhasil dihapus");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {totalStok > 0 && (
        <button 
          onClick={handleDeactivate}
          disabled={isDeactivating}
          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" 
          title="Nonaktifkan Produk (Ubah Stok 0)"
        >
          {isDeactivating ? <Loader2 size={16} className="animate-spin" /> : <PowerOff size={16} />}
        </button>
      )}
      <Link 
        href={`/admin/produk/${productId}/edit`}
        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer" 
        title="Edit Produk"
      >
        <Edit size={16} />
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" 
        title="Hapus Produk"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}