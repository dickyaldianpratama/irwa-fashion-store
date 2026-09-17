"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit2, Check, X, Loader2, ImageIcon, Trash2, Plus, FolderOpen, AlertCircle
} from "lucide-react";
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

export default function KategoriManager({ kategori }: Props) {
  const [items, setItems] = useState<KategoriItem[]>(kategori);

  // State edit inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ nama: "", image: "" });
  const [saving, setSaving] = useState(false);

  // State hapus
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State tambah baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({ nama: "", image: "" });
  const [adding, setAdding] = useState(false);

  // ── EDIT ──────────────────────────────────────────────
  const startEdit = (item: KategoriItem) => {
    setEditingId(item.id);
    setEditData({ nama: item.nama, image: item.image || "" });
  };
  const cancelEdit = () => setEditingId(null);

  const handleSave = async (id: string) => {
    if (!editData.nama.trim()) { toast.error("Nama tidak boleh kosong"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nama: editData.nama.trim(), image: editData.image || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, nama: editData.nama.trim(), image: editData.image || null } : item
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

  // ── TAMBAH ────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newData.nama.trim()) { toast.error("Nama kategori wajib diisi"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newData.nama.trim(), image: newData.image || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan");
      setItems((prev) => [...prev, data.data].sort((a, b) => a.nama.localeCompare(b.nama)));
      toast.success(`Kategori "${newData.nama}" berhasil ditambahkan!`);
      setNewData({ nama: "", image: "" });
      setShowAddModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  // ── HAPUS ─────────────────────────────────────────────
  const handleDelete = async (item: KategoriItem) => {
    if (item._count.produk > 0) {
      toast.error(`Tidak bisa dihapus — masih ada ${item._count.produk} produk di kategori ini.`);
      return;
    }
    if (!confirm(`Hapus kategori "${item.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`Kategori "${item.nama}" dihapus.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Tombol Tambah */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} kategori terdaftar</p>
        <button
          onClick={() => { setNewData({ nama: "", image: "" }); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {/* Grid Kategori */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium">Belum ada kategori</p>
          <p className="text-sm mt-1">Klik &quot;Tambah Kategori&quot; untuk memulai</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              {/* Gambar */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {item.image ? (
                  <Image src={item.image} alt={item.nama} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs">Belum ada gambar</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {editingId === item.id ? (
                  /* Mode Edit */
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nama Kategori</label>
                      <input
                        value={editData.nama}
                        onChange={(e) => setEditData((p) => ({ ...p, nama: e.target.value }))}
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        placeholder="Nama kategori"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">URL Gambar</label>
                      <input
                        value={editData.image}
                        onChange={(e) => setEditData((p) => ({ ...p, image: e.target.value }))}
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-2">
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
                  /* Mode View */
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.nama}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/{item.slug}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        item._count.produk > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                      }`}>
                        {item._count.produk} produk
                      </span>
                    </div>

                    {item._count.produk > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg">
                        <AlertCircle size={12} />
                        Hapus produknya dulu sebelum bisa menghapus kategori ini
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id || item._count.produk > 0}
                        className="flex items-center justify-center gap-1 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={item._count.produk > 0 ? "Tidak bisa dihapus — masih ada produk" : "Hapus kategori"}
                      >
                        {deletingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tambah Kategori Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  value={newData.nama}
                  onChange={(e) => setNewData((p) => ({ ...p, nama: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Kemeja, Kaos & Polo, Celana..."
                  autoFocus
                />
                {newData.nama && (
                  <p className="text-xs text-gray-400">
                    Slug: <span className="font-mono text-gray-600 dark:text-gray-300">
                      /{newData.nama.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-")}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL Gambar <span className="text-gray-400 font-normal">(opsional, bisa diisi nanti)</span>
                </label>
                <input
                  value={newData.image}
                  onChange={(e) => setNewData((p) => ({ ...p, image: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                  type="url"
                />
                {/* Preview gambar */}
                {newData.image && (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mt-2">
                    <Image src={newData.image} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !newData.nama.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}