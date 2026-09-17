"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit2, Check, X, Loader2, ImageIcon,
  Trash2, Plus, FolderOpen, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ nama: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({ nama: "", image: "" });
  const [adding, setAdding] = useState(false);
  // Mobile: collapse card body
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── EDIT ──────────────────────────────────────────────
  const startEdit = (item: KategoriItem) => {
    setEditingId(item.id);
    setExpandedId(item.id);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} kategori terdaftar
        </p>
        <button
          onClick={() => { setNewData({ nama: "", image: "" }); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Kategori</span>
          <span className="sm:hidden">Tambah</span>
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
        /* ── RESPONSIVE GRID ─────────────────────────────
           Mobile  : 1 kolom (full width, layout horizontal)
           Tablet  : 2 kolom
           Desktop : 3 kolom
        ────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-shadow hover:shadow-md"
              >
                {/* ─── MOBILE: Layout horizontal (gambar kiri + info kanan) ─── */}
                {!isEditing && (
                  <div className="flex sm:flex-col">
                    {/* Gambar */}
                    <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] shrink-0 bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.nama}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-1">
                          <ImageIcon size={20} className="sm:w-8 sm:h-8" />
                          <span className="text-[10px] sm:text-xs hidden sm:block">Belum ada gambar</span>
                        </div>
                      )}
                    </div>

                    {/* Info + Aksi */}
                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{item.nama}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">/{item.slug}</p>
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
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg mt-2">
                          <AlertCircle size={12} />
                          Hapus produknya dulu sebelum bisa menghapus kategori ini
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => startEdit(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id || item._count.produk > 0}
                          className="flex items-center justify-center gap-1 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title={item._count.produk > 0 ? "Masih ada produk di kategori ini" : "Hapus kategori"}
                        >
                          {deletingId === item.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Trash2 size={12} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── MODE EDIT (full card, semua device) ─── */}
                {isEditing && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Edit: {item.nama}</p>
                      <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Nama */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nama Kategori</label>
                      <input
                        value={editData.nama}
                        onChange={(e) => setEditData((p) => ({ ...p, nama: e.target.value }))}
                        className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama kategori"
                        autoFocus
                      />
                    </div>

                    {/* Image Uploader */}
                    <ImageUploader
                      value={editData.image}
                      onChange={(url) => setEditData((p) => ({ ...p, image: url }))}
                      folder="kategori"
                      label="Gambar Kategori"
                      aspectRatio="aspect-[4/3]"
                    />

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-lg disabled:opacity-60 font-semibold transition-colors"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL TAMBAH KATEGORI ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Bottom sheet di mobile, modal centered di sm+ */}
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tambah Kategori Baru</h3>
                <p className="text-xs text-gray-500 mt-0.5">Kategori akan langsung muncul di homepage</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Nama */}
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
                    Slug otomatis:{" "}
                    <span className="font-mono text-gray-600 dark:text-gray-300">
                      /{newData.nama.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-") || "..."}
                    </span>
                  </p>
                )}
              </div>

              {/* Image Uploader */}
              <ImageUploader
                value={newData.image}
                onChange={(url) => setNewData((p) => ({ ...p, image: url }))}
                folder="kategori"
                label="Gambar Kategori (opsional, bisa diisi nanti)"
                aspectRatio="aspect-[4/3]"
              />
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !newData.nama.trim()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
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