"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ImageIcon,
  ShoppingBag,
  Shirt,
  Footprints,
  Glasses,
  Sparkles,
  Link as LinkIcon,
  Layers,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface Look {
  id: string;
  title: string;
  deskripsi: string | null;
  image: string;
  totalHarga: number;
}

interface Props {
  looks: Look[];
  allProducts?: any[];
}

const emptyForm = {
  title: "",
  deskripsi: "",
  image: "",
  totalHarga: "",
  bajuUrl: "",
  celanaUrl: "",
  aksesorisUrl: "",
  sepatuUrl: "",
  topiUrl: "",
};

export default function ShopTheLookManager({ looks: initialLooks }: Props) {
  const [looks, setLooks] = useState<Look[]>(initialLooks);
  const [showModal, setShowModal] = useState(false);
  const [editingLook, setEditingLook] = useState<Look | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const openCreate = () => {
    setEditingLook(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const parseExternalItems = (desc: string | null) => {
    if (!desc) return { mainDesc: "", baju: "", celana: "", aksesoris: "", sepatu: "", topi: "", itemCount: 0 };

    let mainDesc = desc;
    let baju = "";
    let celana = "";
    let aksesoris = "";
    let sepatu = "";
    let topi = "";
    let itemCount = 0;

    const match = desc.match(/\[Items: (.*?)\]/);
    if (match && match[1]) {
      mainDesc = desc.replace(/\[Items: .*?\]/, "").trim();
      const parts = match[1].split(" | ");
      itemCount = parts.length;
      parts.forEach((p) => {
        if (p.startsWith("Baju: ")) baju = p.replace("Baju: ", "");
        if (p.startsWith("Celana: ")) celana = p.replace("Celana: ", "");
        if (p.startsWith("Aksesori: ")) aksesoris = p.replace("Aksesori: ", "");
        if (p.startsWith("Sepatu: ")) sepatu = p.replace("Sepatu: ", "");
        if (p.startsWith("Topi: ")) topi = p.replace("Topi: ", "");
      });
    }

    return { mainDesc, baju, celana, aksesoris, sepatu, topi, itemCount };
  };

  const openEdit = (look: Look) => {
    setEditingLook(look);
    const parsed = parseExternalItems(look.deskripsi);
    setForm({
      title: look.title,
      deskripsi: parsed.mainDesc,
      image: look.image,
      totalHarga: look.totalHarga ? look.totalHarga.toString() : "",
      bajuUrl: parsed.baju,
      celanaUrl: parsed.celana,
      aksesorisUrl: parsed.aksesoris,
      sepatuUrl: parsed.sepatu,
      topiUrl: parsed.topi,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      toast.error("Judul Look dan URL Gambar Utama wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const itemsList = [
        form.bajuUrl.trim() && `Baju: ${form.bajuUrl.trim()}`,
        form.celanaUrl.trim() && `Celana: ${form.celanaUrl.trim()}`,
        form.aksesorisUrl.trim() && `Aksesori: ${form.aksesorisUrl.trim()}`,
        form.sepatuUrl.trim() && `Sepatu: ${form.sepatuUrl.trim()}`,
        form.topiUrl.trim() && `Topi: ${form.topiUrl.trim()}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const fullDeskripsi = form.deskripsi.trim()
        ? `${form.deskripsi.trim()}${itemsList ? ` [Items: ${itemsList}]` : ""}`
        : itemsList
        ? `[Items: ${itemsList}]`
        : "";

      const payload = {
        title: form.title,
        deskripsi: fullDeskripsi,
        image: form.image,
        totalHarga: parseInt(form.totalHarga) || 0,
        produkIds: [],
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
      title: "Hapus Shop The Look?",
      html: `Apakah Anda yakin ingin menghapus look <b>${title}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl dark:bg-gray-900 dark:text-white",
        title: "dark:text-white",
        htmlContainer: "dark:text-gray-300",
      },
    });

    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/shop-the-look/${id}`, {
        method: "DELETE",
      });
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
    <div className="space-y-6 select-none font-sans">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-gray-700 dark:text-gray-300" />
            Shop The Look Manager
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {looks.length} outfit look set terdaftar
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} /> Buat Paket Look Set
        </button>
      </div>

      {/* Grid Looks - Clean International E-Commerce Style */}
      {looks.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16 text-gray-400">
          <ShoppingBag size={44} className="mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Belum ada outfit look set</p>
          <p className="text-xs text-gray-400 mt-1">Klik &quot;Buat Paket Look Set&quot; untuk mulai menambahkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {looks.map((look) => {
            const { itemCount, mainDesc } = parseExternalItems(look.deskripsi);

            return (
              <div
                key={look.id}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800/80 overflow-hidden">
                  {look.image ? (
                    <Image
                      src={look.image}
                      alt={look.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-1.5">
                      <ImageIcon size={22} className="opacity-40" />
                      <span className="text-[10px] font-medium">No Image</span>
                    </div>
                  )}

                  {/* Badge Top Left */}
                  <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xs">
                    {itemCount > 0 ? `${itemCount} Items Set` : "Outfit Set"}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-gray-900 dark:text-white truncate leading-snug group-hover:text-primary transition-colors">
                      {look.title}
                    </h3>
                    {mainDesc && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 font-normal">
                        {mainDesc}
                      </p>
                    )}
                  </div>

                  {/* Price Tag & Action Footer */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 space-y-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                        Harga Set
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight font-mono">
                        {formatRupiah(look.totalHarga)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(look)}
                        className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 size={11} /> Edit Set
                      </button>

                      <button
                        onClick={() => handleDelete(look.id, look.title)}
                        disabled={deletingId === look.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Hapus Look"
                      >
                        {deletingId === look.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                  {editingLook ? "Edit Paket Look Set" : "Buat Paket Look Set Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Input 5 URL/link gambar eksternal (Baju, Celana, Aksesori, Sepatu, Topi)
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Judul Look */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200">
                  Judul Look Set *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Contoh: Casual & Daily Wear, Executive Office Set..."
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200">
                  Deskripsi Look (Opsional)
                </label>
                <input
                  value={form.deskripsi}
                  onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Contoh: Memberikan kesan KECE dan RAPI dalam keseharianmu"
                />
              </div>

              {/* URL Gambar Look Utuh */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200">
                  URL Gambar Utama Look (Foto Peragaan 1 Set Utuh) *
                </label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="https://..."
                  type="url"
                />
                {form.image && (
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mt-2 border border-gray-200 dark:border-gray-700">
                    <Image src={form.image} alt="Preview Look" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* SECTION: 5 Slot Input URL Eksternal Item Penyusun */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <LinkIcon size={13} className="text-gray-500" />
                    Import 5 Link / URL Gambar Eksternal Item Set
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Masukkan URL link gambar item penyusun outfit (Baju, Celana, Aksesori, Sepatu, Topi)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Baju */}
                  <div className="space-y-1 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                      <Shirt size={13} className="text-blue-500" /> 1. Baju / Atasan
                    </label>
                    <input
                      type="text"
                      value={form.bajuUrl}
                      onChange={(e) => setForm((p) => ({ ...p, bajuUrl: e.target.value }))}
                      placeholder="https://... URL Gambar Baju"
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  {/* 2. Celana */}
                  <div className="space-y-1 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                      <Shirt size={13} className="text-indigo-500" /> 2. Celana / Bawahan
                    </label>
                    <input
                      type="text"
                      value={form.celanaUrl}
                      onChange={(e) => setForm((p) => ({ ...p, celanaUrl: e.target.value }))}
                      placeholder="https://... URL Gambar Celana"
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  {/* 3. Aksesori */}
                  <div className="space-y-1 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                      <Glasses size={13} className="text-amber-500" /> 3. Aksesori
                    </label>
                    <input
                      type="text"
                      value={form.aksesorisUrl}
                      onChange={(e) => setForm((p) => ({ ...p, aksesorisUrl: e.target.value }))}
                      placeholder="https://... URL Gambar Aksesori"
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  {/* 4. Sepatu */}
                  <div className="space-y-1 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                      <Footprints size={13} className="text-purple-500" /> 4. Sepatu / Alas Kaki
                    </label>
                    <input
                      type="text"
                      value={form.sepatuUrl}
                      onChange={(e) => setForm((p) => ({ ...p, sepatuUrl: e.target.value }))}
                      placeholder="https://... URL Gambar Sepatu"
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  {/* 5. Topi */}
                  <div className="space-y-1 sm:col-span-2 bg-gray-50/70 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70">
                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                      <Sparkles size={13} className="text-rose-500" /> 5. Topi / Headwear
                    </label>
                    <input
                      type="text"
                      value={form.topiUrl}
                      onChange={(e) => setForm((p) => ({ ...p, topiUrl: e.target.value }))}
                      placeholder="https://... URL Gambar Topi"
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Total Harga Set Paket */}
              <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Tag size={13} className="text-gray-700 dark:text-gray-300" />
                  Total Harga 1 Paket Set Lengkap (Rp) *
                </label>
                <input
                  type="number"
                  value={form.totalHarga}
                  onChange={(e) => setForm((p) => ({ ...p, totalHarga: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                  placeholder="Contoh: 849997"
                />
                <p className="text-[11px] text-gray-400">
                  Tentukan langsung total harga paket set (tanpa rincian harga per barang).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex gap-2.5 sticky bottom-0 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {editingLook ? "Simpan Perubahan Set" : "Buat Paket Set"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}