"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit2, Check, X, Loader2, ImageIcon,
  Trash2, Plus, FolderOpen, Star, MessageSquare, Tag, DollarSign, FileText
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
  deskripsi?: string | null;
  hargaAsli?: number | null;
  hargaDiskon?: number | null;
  labelPromo?: string | null;
  rating?: number | null;
  ulasanText?: string | null;
  itemsData?: string | null;
}

interface Props {
  kategori: KategoriItem[];
}

export default function KategoriPilihanManager({ kategori }: Props) {
  const [items, setItems] = useState<KategoriItem[]>(kategori);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    nama: "",
    image: "",
    deskripsi: "",
    hargaAsli: "",
    hargaDiskon: "",
    labelPromo: "",
    rating: "5.0",
    ulasanText: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({
    nama: "",
    image: "",
    deskripsi: "",
    hargaAsli: "",
    hargaDiskon: "",
    labelPromo: "",
    rating: "5.0",
    ulasanText: "",
  });
  const [adding, setAdding] = useState(false);

  // ── EDIT ──────────────────────────────────────────────
  const startEdit = (item: KategoriItem) => {
    setEditingId(item.id);
    setEditData({
      nama: item.nama || "",
      image: item.image || "",
      deskripsi: item.deskripsi || "",
      hargaAsli: item.hargaAsli ? String(item.hargaAsli) : "",
      hargaDiskon: item.hargaDiskon ? String(item.hargaDiskon) : "",
      labelPromo: item.labelPromo || "",
      rating: item.rating ? String(item.rating) : "5.0",
      ulasanText: item.ulasanText || "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const handleSave = async (id: string) => {
    if (!editData.nama.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id,
        nama: editData.nama.trim(),
        image: editData.image || null,
        deskripsi: editData.deskripsi || null,
        hargaAsli: editData.hargaAsli ? parseInt(editData.hargaAsli) : null,
        hargaDiskon: editData.hargaDiskon ? parseInt(editData.hargaDiskon) : null,
        labelPromo: editData.labelPromo || null,
        rating: editData.rating ? parseFloat(editData.rating) : 5.0,
        ulasanText: editData.ulasanText || null,
      };

      const res = await fetch("/api/admin/kategori", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data.data } : item
        )
      );
      toast.success("Kategori Pilihan berhasil diperbarui!");
      setEditingId(null);
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
      const payload = {
        nama: newData.nama.trim(),
        image: newData.image || null,
        deskripsi: newData.deskripsi || null,
        hargaAsli: newData.hargaAsli ? parseInt(newData.hargaAsli) : null,
        hargaDiskon: newData.hargaDiskon ? parseInt(newData.hargaDiskon) : null,
        labelPromo: newData.labelPromo || null,
        rating: newData.rating ? parseFloat(newData.rating) : 5.0,
        ulasanText: newData.ulasanText || null,
      };

      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan");

      setItems((prev) => [...prev, data.data].sort((a, b) => a.nama.localeCompare(b.nama)));
      toast.success(`Kategori "${newData.nama}" berhasil ditambahkan!`);
      setNewData({
        nama: "",
        image: "",
        deskripsi: "",
        hargaAsli: "",
        hargaDiskon: "",
        labelPromo: "",
        rating: "5.0",
        ulasanText: "",
      });
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
            setNewData({
              nama: "",
              image: "",
              deskripsi: "",
              hargaAsli: "",
              hargaDiskon: "",
              labelPromo: "",
              rating: "5.0",
              ulasanText: "",
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Tambah Kategori Pilihan</span>
        </button>
      </div>

      {/* Grid Kategori Pilihan */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-700 dark:text-gray-300">Belum ada Kategori Pilihan</p>
          <p className="text-sm mt-1">Klik &quot;Tambah Kategori Pilihan&quot; untuk menginput data baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {!isEditing ? (
                  <div>
                    {/* Header Image & Badge */}
                    <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800">
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
                          <ImageIcon size={28} />
                          <span className="text-xs">Belum ada gambar</span>
                        </div>
                      )}
                      {item.labelPromo && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                          {item.labelPromo}
                        </span>
                      )}
                      {item.rating && (
                        <span className="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                          <Star size={12} className="fill-gray-900 text-gray-900" />
                          {item.rating}
                        </span>
                      )}
                    </div>

                    {/* Card Content Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                          {item.nama}
                        </h3>
                        {item.deskripsi && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>

                      {/* Pricing Info */}
                      {(item.hargaAsli || item.hargaDiskon) && (
                        <div className="flex items-baseline gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                          {item.hargaDiskon ? (
                            <>
                              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                                Rp {item.hargaDiskon.toLocaleString("id-ID")}
                              </span>
                              {item.hargaAsli && (
                                <span className="text-xs text-gray-400 line-through">
                                  Rp {item.hargaAsli.toLocaleString("id-ID")}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              Rp {item.hargaAsli?.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ulasan Customer */}
                      {item.ulasanText && (
                        <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-[11px] text-gray-500 font-semibold mb-0.5 flex items-center gap-1">
                            <MessageSquare size={12} /> Ulasan Customer:
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-2">
                            &ldquo;{item.ulasanText}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                        Edit Detail
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="flex items-center justify-center gap-1 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                        title="Hapus"
                      >
                        {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── FORM EDIT FULL ────────────────────────────────── */
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Edit Kategori: {item.nama}
                      </h4>
                      <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Kategori *</label>
                        <input
                          value={editData.nama}
                          onChange={(e) => setEditData((p) => ({ ...p, nama: e.target.value }))}
                          className="w-full p-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1"
                        />
                      </div>

                      <ImageUploader
                        value={editData.image}
                        onChange={(url) => setEditData((p) => ({ ...p, image: url }))}
                        folder="kategori"
                        label="Gambar Cover / Banner"
                        aspectRatio="aspect-[16/9]"
                      />

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deskripsi & Bahan Kain</label>
                        <textarea
                          rows={2}
                          value={editData.deskripsi}
                          onChange={(e) => setEditData((p) => ({ ...p, deskripsi: e.target.value }))}
                          placeholder="Detail bahan (contoh: Katun 100%, Soft stretchable)"
                          className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Harga Asli (Rp)</label>
                          <input
                            type="number"
                            value={editData.hargaAsli}
                            onChange={(e) => setEditData((p) => ({ ...p, hargaAsli: e.target.value }))}
                            placeholder="150000"
                            className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Harga Diskon (Rp)</label>
                          <input
                            type="number"
                            value={editData.hargaDiskon}
                            onChange={(e) => setEditData((p) => ({ ...p, hargaDiskon: e.target.value }))}
                            placeholder="120000"
                            className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Label Promo</label>
                          <input
                            value={editData.labelPromo}
                            onChange={(e) => setEditData((p) => ({ ...p, labelPromo: e.target.value }))}
                            placeholder="Flash Sale / Promo"
                            className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rating Customer (1-5)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={editData.rating}
                            onChange={(e) => setEditData((p) => ({ ...p, rating: e.target.value }))}
                            className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Ulasan Customer</label>
                        <textarea
                          rows={2}
                          value={editData.ulasanText}
                          onChange={(e) => setEditData((p) => ({ ...p, ulasanText: e.target.value }))}
                          placeholder="Input komentar ulasan dari customer"
                          className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 rounded-lg text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg font-semibold"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL TAMBAH KATEGORI PILIHAN ────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tambah Kategori Pilihan Baru</h3>
                <p className="text-xs text-gray-500">Lengkapi data kategori pilihan beserta harga, promo, dan ulasan</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nama Kategori Pilihan <span className="text-red-500">*</span>
                </label>
                <input
                  value={newData.nama}
                  onChange={(e) => setNewData((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Contoh: Celana (Gabungan Celana Pendek, Panjang, Renang)"
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <ImageUploader
                value={newData.image}
                onChange={(url) => setNewData((p) => ({ ...p, image: url }))}
                folder="kategori"
                label="Gambar Cover / Banner"
                aspectRatio="aspect-[16/9]"
              />

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deskripsi & Bahan Kain</label>
                <textarea
                  rows={2}
                  value={newData.deskripsi}
                  onChange={(e) => setNewData((p) => ({ ...p, deskripsi: e.target.value }))}
                  placeholder="Contoh: Terdiri dari celana pendek & panjang bahan Katun Chino Premium"
                  className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Harga Asli (Rp)</label>
                  <input
                    type="number"
                    value={newData.hargaAsli}
                    onChange={(e) => setNewData((p) => ({ ...p, hargaAsli: e.target.value }))}
                    placeholder="150000"
                    className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Harga Diskon (Rp)</label>
                  <input
                    type="number"
                    value={newData.hargaDiskon}
                    onChange={(e) => setNewData((p) => ({ ...p, hargaDiskon: e.target.value }))}
                    placeholder="120000"
                    className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Label Promo</label>
                  <input
                    value={newData.labelPromo}
                    onChange={(e) => setNewData((p) => ({ ...p, labelPromo: e.target.value }))}
                    placeholder="Contoh: Flash Sale / Promo 30%"
                    className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rating Customer (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newData.rating}
                    onChange={(e) => setNewData((p) => ({ ...p, rating: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Ulasan Customer</label>
                <textarea
                  rows={2}
                  value={newData.ulasanText}
                  onChange={(e) => setNewData((p) => ({ ...p, ulasanText: e.target.value }))}
                  placeholder="Input ulasan dari pembeli..."
                  className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 mt-1"
                />
              </div>
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
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
