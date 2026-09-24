"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit2, Check, X, Loader2, ImageIcon,
  Trash2, Plus, FolderOpen
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface KategoriItem {
  id: string;
  nama: string;
  slug: string;
  image: string | null;
}

interface Props {
  kategori: KategoriItem[];
}

export default function KategoriPilihanManager({ kategori }: Props) {
  const [items, setItems] = useState<KategoriItem[]>(kategori);

  // State Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KategoriItem | null>(null);
  const [editData, setEditData] = useState({ nama: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State Modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({ nama: "", image: "" });
  const [adding, setAdding] = useState(false);

  // ── EDIT MODAL ──────────────────────────────────────────
  const startEdit = (item: KategoriItem) => {
    setEditingItem(item);
    setEditData({ nama: item.nama || "", image: item.image || "" });
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    if (!editData.nama.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          nama: editData.nama.trim(),
          image: editData.image || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...data.data } : item
        )
      );
      toast.success("Kategori Pilihan berhasil diperbarui!");
      cancelEdit();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── TAMBAH ────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newData.nama.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: newData.nama.trim(),
          image: newData.image || null,
        }),
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

  // ── HAPUS ────────────────────────────────────────────
  const handleDelete = async (item: KategoriItem) => {
    const result = await MySwal.fire({
      title: 'Hapus Kategori Pilihan?',
      html: `Apakah Anda yakin ingin menghapus <b>${item.nama}</b>?`,
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
      toast.success(`Kategori "${item.nama}" telah dihapus.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} Kategori Pilihan terdaftar
        </p>
        <button
          onClick={() => {
            setNewData({ nama: "", image: "" });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Kategori Pilihan</span>
        </button>
      </div>

      {/* Grid Cards Clean Layout */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-700 dark:text-gray-300">Belum ada Kategori Pilihan</p>
          <p className="text-sm mt-1">Klik &quot;Tambah Kategori Pilihan&quot; untuk menginput data baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Preview */}
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
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-1">
                      <ImageIcon size={24} />
                      <span className="text-[10px]">Tanpa Gambar</span>
                    </div>
                  )}
                </div>

                {/* Info Title */}
                <div className="p-3 text-center">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {item.nama}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2.5 pt-0 flex gap-1.5">
                <button
                  onClick={() => startEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="flex items-center justify-center text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                  title="Hapus"
                >
                  {deletingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL LAYER EDIT ──────────────────────────────────────────── */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Kategori Pilihan</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ubah nama dan gambar cover kategori</p>
              </div>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  value={editData.nama}
                  onChange={(e) => setEditData((p) => ({ ...p, nama: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nama Kategori"
                  autoFocus
                />
              </div>

              <ImageUploader
                value={editData.image}
                onChange={(url) => setEditData((p) => ({ ...p, image: url }))}
                folder="kategori"
                label="Gambar Cover"
                aspectRatio="aspect-[4/3]"
              />
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editData.nama.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LAYER TAMBAH ───────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tambah Kategori Pilihan</h3>
                <p className="text-xs text-gray-500 mt-0.5">Input nama dan gambar untuk kategori baru</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  value={newData.nama}
                  onChange={(e) => setNewData((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Contoh: Celana, Kemeja, Kaos, Jaket..."
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <ImageUploader
                value={newData.image}
                onChange={(url) => setNewData((p) => ({ ...p, image: url }))}
                folder="kategori"
                label="Gambar Cover"
                aspectRatio="aspect-[4/3]"
              />
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !newData.nama.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
