"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  productName: string;
}

export default function ProductTableActions({ productId, productName }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
      return;
    }

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
      <Link 
        href={`/admin/produk/${productId}/edit`}
        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
        title="Edit Produk"
      >
        <Edit size={16} />
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50" 
        title="Hapus Produk"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}