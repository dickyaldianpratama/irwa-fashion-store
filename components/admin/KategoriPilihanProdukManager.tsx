"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Loader2,
  X,
  ImageIcon,
  Package,
  ChevronDown,
  Tag,
  Ruler,
  FileText,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface KategoriPilihan {
  id: string;
  nama: string;
  slug: string;
}

interface ProdukImage {
  id: string;
  url: string;
  isUtama: boolean;
}

interface Produk {
  id: string;
  kategoriPilihanId: string;
  nama: string;
  harga: number;
  hargaDiskon: number | null;
  ukuran: string | null;
  deskripsi: string | null;
  images: ProdukImage[];
}

interface Props {
  kategoriList: KategoriPilihan[];
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const emptyForm = {
  nama: "",
  harga: "",
  hargaDiskon: "",
  ukuran: "",
  deskripsi: "",
};

export default function KategoriPilihanProdukManager({ kategoriList }: Props) {
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>(
    kategoriList[0]?.id || ""
  );
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);

  const fetchProduk = async (kategoriId: string) => {
    if (!kategoriId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/kategori-pilihan-produk?kategoriPilihanId=${kategoriId}`
      );
      const data = await res.json();
      setProdukList(data.data || []);
    } catch {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk(selectedKategoriId);
  }, [selectedKategoriId]);

  // ── IMAGE SLOT HELPERS ──────────────────────────────────────────
  const addImageSlot = () => setImages((prev) => [...prev, ""]);
  const removeImageSlot = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));
  const updateImageSlot = (idx: number, url: string) =>
    setImages((prev) => prev.map((u, i) => (i === idx ? url : u)));

  // ── OPEN MODAL ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditingProduk(null);
    setForm(emptyForm);
    setImages([]);
    setShowModal(true);
  };

  const openEdit = (p: Produk) => {
    setEditingProduk(p);
    setForm({
      nama: p.nama,
      harga: String(p.harga),
      hargaDiskon: p.hargaDiskon ? String(p.hargaDiskon) : "",
      ukuran: p.ukuran || "",
      deskripsi: p.deskripsi || "",
    });
    const sorted = [...p.images].sort((a, b) =>
      b.isUtama ? 1 : a.isUtama ? -1 : 0
    );
    setImages(sorted.map((img) => img.url));
    setShowModal(true);
  };

  // ── SAVE (CREATE or UPDATE) ─────────────────────────────────────
  const handleSave = async () => {
    if (!form.nama.trim() || !form.harga) {
      toast.error("Nama produk dan harga wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editingProduk ? { id: editingProduk.id } : { kategoriPilihanId: selectedKategoriId }),
        nama: form.nama.trim(),
        harga: Number(form.harga),
        hargaDiskon: form.hargaDiskon ? Number(form.hargaDiskon) : null,
        ukuran: form.ukuran.trim() || null,
        deskripsi: form.deskripsi.trim() || null,
        images: images.filter(Boolean),
      };

      const res = await fetch("/api/admin/kategori-pilihan-produk", {
        method: editingProduk ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      if (editingProduk) {
        setProdukList((prev) =>
          prev.map((p) => (p.id === editingProduk.id ? data.data : p))
        );
        toast.success("Produk berhasil diperbarui!");
      } else {
        setProdukList((prev) => [data.data, ...prev]);
        toast.success(`Produk "${form.nama}" berhasil ditambahkan!`);
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ───────────────────────────────────────────────────────
  const handleDelete = async (p: Produk) => {
    const result = await MySwal.fire({
      title: "Hapus Produk?",
      html: `Apakah Anda yakin ingin menghapus <b>${p.nama}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#111827",
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
    setDeletingId(p.id);
    try {
      const res = await fetch("/api/admin/kategori-pilihan-produk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      setProdukList((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(`Produk "${p.nama}" telah dihapus.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const selectedKategori = kategoriList.find((k) => k.id === selectedKategoriId);

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5 select-none font-sans">
      {kategoriList.length === 0 ? (
        /* Empty State — no kategori */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16 text-gray-400">
          <Package size={44} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Belum ada Kategori Pilihan
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tambahkan Kategori Pilihan (Home) terlebih dahulu di tab sebelumnya.
          </p>
        </div>
      ) : (
        <>
          {/* ── Header Action Bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
            {/* Kategori Selector */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Kategori Aktif
              </p>
              <div className="relative max-w-xs">
                <select
                  value={selectedKategoriId}
                  onChange={(e) => setSelectedKategoriId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900/20 focus:outline-none appearance-none cursor-pointer transition-all"
                >
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={openCreate}
              className="bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <Plus size={15} />
              Tambah Produk
            </button>
          </div>

          {/* ── Product Count Info ── */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-gray-900 dark:bg-white rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? (
                "Memuat produk..."
              ) : (
                <>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {produkList.length}
                  </span>{" "}
                  produk di kategori{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedKategori?.nama}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* ── Product Grid ── */}
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-gray-400" />
                <p className="text-sm text-gray-400">Memuat produk...</p>
              </div>
            </div>
          ) : produkList.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16 text-gray-400">
              <Package size={44} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Belum ada produk di kategori {selectedKategori?.nama}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Klik &quot;Tambah Produk&quot; untuk mulai mengisi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {produkList.map((p) => {
                const sorted = [...p.images].sort((a, b) =>
                  b.isUtama ? 1 : a.isUtama ? -1 : 0
                );
                const mainImg = sorted[0]?.url;
                const isDiskon = !!(p.hargaDiskon && p.hargaDiskon < p.harga);

                return (
                  <div
                    key={p.id}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800/80 overflow-hidden">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={p.nama}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-1.5">
                          <ImageIcon size={22} className="opacity-40" />
                          <span className="text-[10px] font-medium">No Image</span>
                        </div>
                      )}
                      {isDiskon && (
                        <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          DISKON
                        </div>
                      )}
                      {p.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          +{p.images.length - 1} foto
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1">
                        <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {p.nama}
                        </h3>
                        {p.ukuran && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {p.ukuran}
                          </p>
                        )}
                      </div>

                      {/* Price + Actions */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 space-y-2">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                            Harga
                          </span>
                          {isDiskon ? (
                            <>
                              <span className="text-[10px] text-gray-400 line-through font-mono">
                                {formatRupiah(p.harga)}
                              </span>
                              <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight font-mono block">
                                {formatRupiah(p.hargaDiskon!)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight font-mono">
                              {formatRupiah(p.harga)}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 size={11} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus Produk"
                          >
                            {deletingId === p.id ? (
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
        </>
      )}

      {/* ── MODAL CREATE / EDIT ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                  {editingProduk ? "Edit Produk" : "Tambah Produk Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Kategori:{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {selectedKategori?.nama}
                  </span>
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
              {/* Nama Produk */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FileText size={13} className="text-gray-500" />
                  Nama Produk *
                </label>
                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nama: e.target.value }))
                  }
                  placeholder="Contoh: Celana Jeans Slim Fit Pria"
                  autoFocus
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all"
                />
              </div>

              {/* Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Tag size={13} className="text-gray-500" />
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={form.harga}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, harga: e.target.value }))
                    }
                    placeholder="150000"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Tag size={13} className="text-red-400" />
                    Harga Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={form.hargaDiskon}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, hargaDiskon: e.target.value }))
                    }
                    placeholder="120000"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Ukuran */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Ruler size={13} className="text-gray-500" />
                  Ukuran
                </label>
                <input
                  value={form.ukuran}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ukuran: e.target.value }))
                  }
                  placeholder="S, M, L, XL"
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all"
                />
                <p className="text-[11px] text-gray-400">
                  Pisahkan dengan koma. Contoh: S, M, L, XL, XXL
                </p>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FileText size={13} className="text-gray-500" />
                  Deskripsi Produk (Opsional)
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deskripsi: e.target.value }))
                  }
                  placeholder="Bahan, detail produk, keunggulan, cara perawatan, dll..."
                  rows={3}
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Foto Produk */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Camera size={13} className="text-gray-500" />
                      Foto Produk
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Foto pertama akan jadi foto utama. Bisa tambah lebih dari 1.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    Tambah Foto
                  </button>
                </div>

                {images.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Camera size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-[11px] text-gray-400">
                      Klik &quot;Tambah Foto&quot; untuk menambahkan gambar produk
                    </p>
                  </div>
                )}

                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Camera size={11} className="text-gray-400" />
                        Foto {idx + 1}
                        {idx === 0 && (
                          <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Utama
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImageSlot(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <ImageUploader
                      value={url}
                      onChange={(newUrl) => updateImageSlot(idx, newUrl)}
                      folder="kategori-produk"
                      label={`Foto ${idx + 1}`}
                      aspectRatio="aspect-[3/4]"
                    />
                  </div>
                ))}
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
                disabled={saving || !form.nama.trim() || !form.harga}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {editingProduk ? "Simpan Perubahan" : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
