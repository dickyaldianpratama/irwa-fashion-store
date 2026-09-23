"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Loader2, ImageIcon, ShoppingBag, Sparkles, Shirt, Footprints, Glasses, CircleCheck } from "lucide-react";
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

const emptyForm = { 
  title: "", 
  deskripsi: "", 
  image: "", 
  totalHarga: "", 
  bajuId: "",
  celanaId: "",
  aksesorisId: "",
  sepatuId: "",
  topiId: ""
};

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
    const itemIds = look.items ? look.items.map((i) => i.produkId) : [];
    setForm({
      title: look.title,
      deskripsi: look.deskripsi || "",
      image: look.image,
      totalHarga: look.totalHarga.toString(),
      bajuId: itemIds[0] || "",
      celanaId: itemIds[1] || "",
      aksesorisId: itemIds[2] || "",
      sepatuId: itemIds[3] || "",
      topiId: itemIds[4] || "",
    });
    setShowModal(true);
  };

  const calculateAutoTotal = () => {
    const selectedIds = [
      form.bajuId,
      form.celanaId,
      form.aksesorisId,
      form.sepatuId,
      form.topiId,
    ].filter(Boolean);

    let sum = 0;
    selectedIds.forEach((id) => {
      const prod = allProducts.find((p) => p.id === id);
      if (prod) {
        sum += prod.hargaDiskon || prod.hargaAsli;
      }
    });

    setForm((prev) => ({ ...prev, totalHarga: sum > 0 ? sum.toString() : prev.totalHarga }));
    toast.success(`Total harga dihitung otomatis: Rp ${sum.toLocaleString("id-ID")}`);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      toast.error("Judul Look dan URL Gambar wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const produkIds = [
        form.bajuId,
        form.celanaId,
        form.aksesorisId,
        form.sepatuId,
        form.topiId,
      ].filter(Boolean);

      const payload = {
        title: form.title,
        deskripsi: form.deskripsi,
        image: form.image,
        totalHarga: parseInt(form.totalHarga) || 0,
        produkIds,
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
        toast.success("Look set berhasil diperbarui!");
      } else {
        setLooks((prev) => [data.data, ...prev]);
        toast.success("Look set baru berhasil ditambahkan!");
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
        <p className="text-sm text-gray-500 dark:text-gray-400">{looks.length} look outfit set terdaftar</p>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus size={16} /> Buat Paket Look Set
        </button>
      </div>

      {/* Grid looks */}
      {looks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium">Belum ada outfit look set</p>
          <p className="text-sm mt-1">Klik &quot;Buat Paket Look Set&quot; untuk mulai menambahkan 1 paket outfit</p>
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
                  <p className="text-emerald-400 font-extrabold text-xs mt-0.5">Total Set: Rp {look.totalHarga.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Card Footer / Actions */}
              <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                {look.items && look.items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {look.items.length} Item dalam Set:
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
                    </div>
                  </div>
                )}

                <div className="flex gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <button
                    onClick={() => openEdit(look)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:hover:bg-blue-600 border border-blue-100 dark:border-blue-900/50 text-[11px] font-semibold py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Edit2 size={12} /> Edit Set
                  </button>
                  <button
                    onClick={() => handleDelete(look.id, look.title)}
                    disabled={deletingId === look.id}
                    className="flex-none flex items-center justify-center gap-1 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-500 border border-red-100 dark:border-red-900/50 w-8 h-8 rounded-lg transition-all disabled:opacity-60 cursor-pointer"
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {editingLook ? "Edit Paket Look Set" : "Buat Paket Look Set Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gabungkan item Baju, Celana, Aksesori, Sepatu, dan Topi menjadi 1 paket set outfit utuh
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Judul Look */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Judul Look Set *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Contoh: Casual & Daily Wear, Executive Office Set..."
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi Look (Opsional)
                </label>
                <input
                  value={form.deskripsi}
                  onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Contoh: Memberikan kesan KECE dan RAPI dalam keseharianmu"
                />
              </div>

              {/* URL Gambar Look Utuh */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL Gambar Utama Look (Foto Model / Peragaan 1 Set Utuh) *
                </label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder="https://..."
                  type="url"
                />
                {form.image && (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 mt-2 border">
                    <Image src={form.image} alt="Preview Look" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* SECTION: 5 Slot Item Penyusun Set Outfit */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      5 Item Penyusun Paket Set Outfit
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Pilih produk yang akan dipaketkan sebagai 1 set lengkap
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* 1. Slot Baju / Atasan */}
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Shirt size={14} className="text-blue-500" /> 1. Baju / Atasan
                    </label>
                    <select
                      value={form.bajuId}
                      onChange={(e) => setForm((p) => ({ ...p, bajuId: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs"
                    >
                      <option value="">-- Pilih Produk Baju --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Rp {(p.hargaDiskon || p.hargaAsli).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Slot Celana / Bawahan */}
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Shirt size={14} className="text-indigo-500" /> 2. Celana / Bawahan
                    </label>
                    <select
                      value={form.celanaId}
                      onChange={(e) => setForm((p) => ({ ...p, celanaId: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs"
                    >
                      <option value="">-- Pilih Produk Celana --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Rp {(p.hargaDiskon || p.hargaAsli).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Slot Aksesori */}
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Glasses size={14} className="text-emerald-500" /> 3. Aksesori (Jam/Kacamata/dll)
                    </label>
                    <select
                      value={form.aksesorisId}
                      onChange={(e) => setForm((p) => ({ ...p, aksesorisId: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs"
                    >
                      <option value="">-- Pilih Produk Aksesori --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Rp {(p.hargaDiskon || p.hargaAsli).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Slot Sepatu */}
                  <div className="space-y-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Footprints size={14} className="text-purple-500" /> 4. Sepatu / Alas Kaki
                    </label>
                    <select
                      value={form.sepatuId}
                      onChange={(e) => setForm((p) => ({ ...p, sepatuId: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs"
                    >
                      <option value="">-- Pilih Produk Sepatu --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Rp {(p.hargaDiskon || p.hargaAsli).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Slot Topi */}
                  <div className="space-y-1 sm:col-span-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-rose-500" /> 5. Topi / Headwear
                    </label>
                    <select
                      value={form.topiId}
                      onChange={(e) => setForm((p) => ({ ...p, topiId: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-gray-900 border rounded-lg dark:border-gray-700 text-xs"
                    >
                      <option value="">-- Pilih Produk Topi --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} (Rp {(p.hargaDiskon || p.hargaAsli).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Total Harga Set Paket */}
              <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    Total Harga 1 Paket Set Lengkap (Rp) *
                  </label>
                  <button
                    type="button"
                    onClick={calculateAutoTotal}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={12} /> Hitung Otomatis Total Harga Item
                  </button>
                </div>
                <input
                  type="number"
                  value={form.totalHarga}
                  onChange={(e) => setForm((p) => ({ ...p, totalHarga: e.target.value }))}
                  className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  placeholder="849997"
                />
                <p className="text-[11px] text-gray-400">
                  Harga ini yang akan langsung tampil utuh ke customer sebagai 1 harga paket set tanpa memecah harga per produk.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingLook ? "Simpan Perubahan Set" : "Buat Paket Set"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}