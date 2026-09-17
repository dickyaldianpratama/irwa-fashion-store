"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit2, Check, X, Loader2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface KategoriItem {
  id: string;
  nama: string;
  slug: string;
  image: string | null;
  _count: { produk: number };
}

interface Props {
  kategori: KategoriItem[];
}

export default function KategoriCard({ kategori }: Props) {
  const [items, setItems] = useState<KategoriItem[]>(kategori);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ nama: "", image: "" });
  const [saving, setSaving] = useState(false);

  const startEdit = (item: KategoriItem) => {
    setEditingId(item.id);
    setEditData({ nama: item.nama, image: item.image || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ nama: "", image: "" });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nama: editData.nama, image: editData.image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, nama: editData.nama, image: editData.image || null }
            : item
        )
      );
      toast.success("Kategori berhasil diperbarui!");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
        >
          {/* Gambar Kategori */}
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.nama}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-2">
                <ImageIcon size={32} />
                <span className="text-xs">Belum ada gambar</span>
              </div>
            )}
          </div>

          {/* Info & Edit */}
          <div className="p-4 space-y-3">
            {editingId === item.id ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nama Kategori</label>
                  <input
                    value={editData.nama}
                    onChange={(e) => setEditData((prev) => ({ ...prev, nama: e.target.value }))}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Nama kategori"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">URL Gambar</label>
                  <input
                    value={editData.image}
                    onChange={(e) => setEditData((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSave(item.id)}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg disabled:opacity-60 transition-colors"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Simpan
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.nama}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item._count.produk} produk</p>
                </div>
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit kategori"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}