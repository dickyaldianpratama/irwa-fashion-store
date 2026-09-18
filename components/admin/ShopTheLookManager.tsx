"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Loader2, ImageIcon, ShoppingBag, Check } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface ProdukOption {
  id: string;
  nama: string;
  hargaAsli: number;
  hargaDiskon: number | null;
  images: { url: string }[];
}

interface LookItem {
  id: string;
  produkId: string;
  produk: ProdukOption;
}

interface Look {
  id: string;
  title: string;
  deskripsi: string | null;
  image: string;
  totalHarga: number;
  items: LookItem[];
}

interface Props {
  looks: Look[];
  allProducts: ProdukOption[];
}

const emptyForm = { title: "", deskripsi: "", image: "", totalHarga: "", produkIds: [] as string[] };

export default function ShopTheLookManager({ looks: initialLooks, allProducts }: Props) {
  const [looks, setLooks] = useState<Look[]>(initialLooks);
  const [showModal, setShowModal] = useState(false);
  const [editingLook, setEditingLook] = useState<Look | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingLook(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (look: Look) => {
    setEditingLook(look);
    setForm({
      title: look.title,
      deskripsi: look.deskripsi || "",
      image: look.image,
      totalHarga: look.totalHarga.toString(),
      produkIds: look.items.map((i) => i.produkId),
    });
    setShowModal(true);
  };

  const toggleProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      produkIds: prev.produkIds.includes(id)
        ? prev.produkIds.filter((p) => p !== id)
        : [...prev.produkIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      toast.error("Judul dan gambar wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        deskripsi: form.deskripsi,
        image: form.image,
        totalHarga: parseInt(form.totalHarga) || 0,
        produkIds: form.produkIds,
      };

      let res;
      if (editingLook) {
        res = await fetch(`/api/admin/shop-the-look/${editingLook.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/shop-the-look", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      if (editingLook) {
        setLooks((prev) =>
          prev.map((l) => (l.id === editingLook.id ? data.data : l))
        );
        toast.success("Look berhasil diperbarui!");
      } else {
        setLooks((prev) => [data.data, ...prev]);
        toast.success("Look baru berhasil ditambahkan!");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await MySwal.fire({
      title: 'Hapus Shop The Look?',
      html: `Apakah Anda yakin ingin menghapus look <b>${title}</b>?`,
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
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/shop-the-look/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setLooks((prev) => prev.filter((l) => l.id !== id));
      toast.success("Look berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{looks.length} look terdaftar</p>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Tambah Look
        </button>
      </div>

      {/* Grid looks */}
      {looks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium">Belum ada look</p>
          <p className="text-sm mt-1">Klik &quot;Tambah Look&quot; untuk mulai membuat outfit set</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {looks.map((look) => (
            <div
              key={look.id}
              className="group bg-white dark:bg-gray-900 rounded-[12px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Gambar look */}
              <div className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {look.image ? (
                  <Image src={look.image} alt={look.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-2">
                    <ImageIcon size={24} />
                    <span className="text-[10px]">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-white font-bold text-sm truncate leading-tight">{look.title}</p>
                  <p className="text-white/90 text-[11px] font-medium mt-0.5">Rp {look.totalHarga.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Produk dalam look */}
              <div className="p-2.5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    {look.items.length} Produk:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {look.items.map((item) => (
                      <span
                        key={item.id}
                        className="text-[10px] bg-gray-50 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded truncate max-w-full"
                      >
                        {item.produk.nama}
                      </span>
                    ))}
                    {look.items.length === 0 && (
                      <span className="text-[10px] text-gray-400 italic">Kosong</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <button
                    onClick={() => openEdit(look)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:hover:bg-blue-600 border border-blue-100 dark:border-blue-900/50 text-[11px] font-semibold py-1.5 rounded-lg transition-all"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(look.id, look.title)}
                    disabled={deletingId === look.id}
                    className="flex-none flex items-center justify-center gap-1 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-500 border border-red-100 dark:border-red-900/50 w-8 h-8 rounded-lg transition-all disabled:opacity-60"
                  >
                    {deletingId === look.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editingLook ? "Edit Look" : "Tambah Look Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Judul */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Judul Look *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Smart Casual Office"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (Opsional)</label>
                <input
                  value={form.deskripsi}
                  onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Deskripsi singkat look ini"
                />
              </div>

              {/* Gambar */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Gambar Look *</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="https://..."
                  type="url"
                />
                {form.image && (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 mt-2">
                    <Image src={form.image} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Total Harga */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Harga Set (Rp)</label>
                <input
                  type="number"
                  value={form.totalHarga}
                  onChange={(e) => setForm((p) => ({ ...p, totalHarga: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="450000"
                />
              </div>

              {/* Pilih Produk */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Produk dalam Look ({form.produkIds.length} dipilih)
                </label>
                <div className="max-h-52 overflow-y-auto border rounded-lg dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  {allProducts.map((prod) => {
                    const selected = form.produkIds.includes(prod.id);
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => toggleProduct(prod.id)}
                        className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors ${
                          selected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {prod.images[0]?.url && (
                            <Image src={prod.images[0].url} alt={prod.nama} fill className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${selected ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                            {prod.nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp {(prod.hargaDiskon || prod.hargaAsli).toLocaleString("id-ID")}
                          </p>
                        </div>
                        {selected && <Check size={16} className="text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingLook ? "Simpan Perubahan" : "Buat Look"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}