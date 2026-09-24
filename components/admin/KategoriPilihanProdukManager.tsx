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
  FileText,
  Camera,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// ── Types ──────────────────────────────────────────────────────────
interface KategoriPilihan {
  id: string;
  nama: string;
  slug: string;
}

interface ProdukImage {
  id: string;
  url: string;
  ukuran?: string | null;
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

// Per-foto item (foto + 1 ukuran, seperti pola KoleksiTerpopuler)
interface FotoItem {
  id: string;
  url: string;
  ukuran: string; // 1 ukuran per foto
}

interface Props {
  kategoriList: KategoriPilihan[];
}

// ── Helpers ────────────────────────────────────────────────────────
const UKURAN_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// Encode foto items + ukuran ke format ukuran string: "S,M,L" dan images array
function buildUkuranString(fotos: FotoItem[]): string {
  const seen = new Set<string>();
  fotos.forEach((f) => { if (f.ukuran) seen.add(f.ukuran); });
  return Array.from(seen).join(",");
}

// Decode: buat FotoItem dari Produk.images + ukuran
function decodeFotos(produk: Produk): FotoItem[] {
  const sorted = [...produk.images].sort((a, b) =>
    b.isUtama ? 1 : a.isUtama ? -1 : 0
  );
  const sizes = produk.ukuran
    ? produk.ukuran.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return sorted.map((img, idx) => ({
    id: img.id || `foto-${idx}`,
    url: img.url,
    ukuran: img.ukuran || sizes[idx] || sizes[0] || "",
  }));
}

// ── Empty form ─────────────────────────────────────────────────────
const emptyForm = {
  nama: "",
  harga: "",
  persenDiskon: "",
  hargaDiskon: "",
  deskripsi: "",
};

const newFoto = (): FotoItem => ({
  id: `foto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  url: "",
  ukuran: "",
});

// ── Component ──────────────────────────────────────────────────────
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
  const [fotos, setFotos] = useState<FotoItem[]>([newFoto()]);

  // ── Fetch produk ──────────────────────────────────────────────────
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

  // ── Harga / diskon logic (pintar seperti KoleksiTerpopuler) ───────
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    if (name === "harga" || name === "persenDiskon") {
      const asli = parseInt(name === "harga" ? value : form.harga) || 0;
      const persen =
        parseInt(name === "persenDiskon" ? value : form.persenDiskon) || 0;
      if (asli > 0 && persen > 0 && persen <= 100) {
        updated.hargaDiskon = (asli - Math.floor((asli * persen) / 100)).toString();
      } else {
        updated.hargaDiskon = "";
      }
    }
    setForm(updated);
  };

  // ── Foto item helpers ─────────────────────────────────────────────
  const handleAddFoto = () => setFotos((prev) => [...prev, newFoto()]);
  const handleRemoveFoto = (id: string) => {
    if (fotos.length <= 1) { toast.error("Minimal harus ada 1 foto"); return; }
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };
  const handleFotoUrl = (id: string, url: string) =>
    setFotos((prev) => prev.map((f) => (f.id === id ? { ...f, url } : f)));
  const handleFotoUkuran = (id: string, ukuran: string) =>
    setFotos((prev) => prev.map((f) => (f.id === id ? { ...f, ukuran } : f)));

  // ── Open modal ────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingProduk(null);
    setForm(emptyForm);
    setFotos([newFoto()]);
    setShowModal(true);
  };

  const openEdit = (p: Produk) => {
    setEditingProduk(p);
    const persen =
      p.hargaDiskon && p.harga > p.hargaDiskon
        ? Math.round(((p.harga - p.hargaDiskon) / p.harga) * 100).toString()
        : "";
    setForm({
      nama: p.nama,
      harga: String(p.harga),
      persenDiskon: persen,
      hargaDiskon: p.hargaDiskon ? String(p.hargaDiskon) : "",
      deskripsi: p.deskripsi || "",
    });
    setFotos(decodeFotos(p).length > 0 ? decodeFotos(p) : [newFoto()]);
    setShowModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nama.trim() || !form.harga) {
      toast.error("Nama produk dan harga wajib diisi");
      return;
    }
    for (let i = 0; i < fotos.length; i++) {
      if (!fotos[i].url) {
        toast.error(`Foto #${i + 1} belum diupload`);
        return;
      }
      if (!fotos[i].ukuran) {
        toast.error(`Pilih 1 ukuran untuk Foto #${i + 1}`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingProduk
          ? { id: editingProduk.id }
          : { kategoriPilihanId: selectedKategoriId }),
        nama: form.nama.trim(),
        harga: Number(form.harga),
        hargaDiskon: form.hargaDiskon ? Number(form.hargaDiskon) : null,
        ukuran: buildUkuranString(fotos) || null,
        deskripsi: form.deskripsi.trim() || null,
        images: fotos
          .filter((f) => Boolean(f.url))
          .map((f) => ({
            url: f.url,
            ukuran: f.ukuran || null,
          })),
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

  // ── Delete ────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 select-none font-sans">
      {kategoriList.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16">
          <Package size={44} className="mx-auto mb-3 opacity-30 text-gray-400" />
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
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Kategori Aktif
              </p>
              <div className="relative max-w-xs">
                <select
                  value={selectedKategoriId}
                  onChange={(e) => setSelectedKategoriId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900/20 focus:outline-none appearance-none cursor-pointer"
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
            <button
              onClick={openCreate}
              className="bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <Plus size={15} />
              Tambah Produk
            </button>
          </div>

          {/* ── Count Info ── */}
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
                <Loader2 size={28} className="animate-spin text-gray-400" />
                <p className="text-sm text-gray-400">Memuat...</p>
              </div>
            </div>
          ) : produkList.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16">
              <Package size={44} className="mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Belum ada produk di kategori {selectedKategori?.nama}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Klik &quot;Tambah Produk&quot; untuk mulai mengisi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {produkList.map((p) => {
                const sorted = [...p.images].sort((a, b) =>
                  b.isUtama ? 1 : a.isUtama ? -1 : 0
                );
                const mainImg = sorted[0]?.url;
                const isDiskon = !!(p.hargaDiskon && p.hargaDiskon < p.harga);
                const persen = isDiskon
                  ? Math.round(((p.harga - p.hargaDiskon!) / p.harga) * 100)
                  : 0;

                return (
                  <div
                    key={p.id}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
                  >
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
                          -{persen}%
                        </div>
                      )}
                      {p.images.length > 1 && (
                        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Layers size={10} /> {p.images.length} Foto
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1">
                        <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug">
                          {p.nama}
                        </h3>
                        {p.deskripsi && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 font-normal">
                            {p.deskripsi}
                          </p>
                        )}
                        {p.ukuran && (
                          <p className="text-[10px] text-gray-400 font-medium">
                            {p.ukuran}
                          </p>
                        )}
                      </div>

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

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus"
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

      {/* ── MODAL ─────────────────────────────────────────────────────── */}
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
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200">
                  Nama Produk *
                </label>
                <input
                  autoFocus
                  value={form.nama}
                  onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Contoh: Celana Jeans Slim Fit Pria"
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all"
                />
              </div>

              {/* Harga + Diskon % */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 dark:text-gray-200">
                    Harga Asli (Rp) *
                  </label>
                  <input
                    type="number"
                    name="harga"
                    value={form.harga}
                    onChange={handleHargaChange}
                    placeholder="150000"
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 dark:text-gray-200">
                    Diskon (%) - Harga Coret
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="persenDiskon"
                      min="0"
                      max="100"
                      value={form.persenDiskon}
                      onChange={handleHargaChange}
                      placeholder="20"
                      className="w-full p-2.5 pr-7 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* Sistem Pintar: tampilkan harga akhir */}
              {form.hargaDiskon && (
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 p-2.5 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <span>Sistem Pintar Otomatis:</span>
                  <span className="font-mono font-bold">
                    Harga Akhir = Rp{" "}
                    {parseInt(form.hargaDiskon).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <FileText size={12} className="text-gray-400" />
                    Deskripsi Produk (Opsional)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      (form.deskripsi?.length || 0) >= 250
                        ? "text-red-500 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {form.deskripsi?.length || 0}/250 karakter
                  </span>
                </div>
                <textarea
                  maxLength={250}
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      deskripsi: e.target.value.slice(0, 250),
                    }))
                  }
                  placeholder="Ringkasan bahan & keunggulan produk (maks. 250 karakter)..."
                  rows={2}
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all resize-none"
                />
                <p className="text-[10px] text-gray-400">
                  * Dibatasi maksimal 250 karakter agar tampilan card tetap rapi, efisien, dan tidak memakan ruang.
                </p>
              </div>

              {/* Foto & Ukuran per foto */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Layers size={14} className="text-gray-500" />
                      Foto &amp; Ukuran Pakaian ({fotos.length})
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Setiap foto wajib memiliki 1 pilihan ukuran masing-masing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFoto}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus size={13} /> Tambah Foto
                  </button>
                </div>

                <div className="space-y-3">
                  {fotos.map((foto, idx) => (
                    <div
                      key={foto.id}
                      className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-200/80 dark:border-gray-700/70 space-y-3"
                    >
                      {/* Foto header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <Camera size={12} className="text-gray-400" />
                          {idx === 0 ? "Foto #1 — Cover Utama" : `Foto Pakaian #${idx + 1}`}
                        </span>
                        {fotos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFoto(foto.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Hapus
                          </button>
                        )}
                      </div>

                      {/* Image Uploader — compact, kotak kecil */}
                      <ImageUploader
                        value={foto.url}
                        onChange={(url) => handleFotoUrl(foto.id, url)}
                        folder="kategori-produk"
                        label={`Upload Foto ${idx === 0 ? "Utama" : `#${idx + 1}`} *`}
                        aspectRatio="aspect-[4/5]"
                        compact
                        previewHeight="h-28"
                      />

                      {/* Ukuran checkbox — 1 pilih per foto */}
                      <div className="pt-1">
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                          Pilih Ukuran Foto Ini (Wajib 1 Ukuran per Foto):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {UKURAN_OPTIONS.map((size) => {
                            const checked = foto.ukuran === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleFotoUkuran(foto.id, size)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  checked
                                    ? "bg-gray-900 text-white border-gray-900 shadow-xs ring-2 ring-gray-900/20 dark:bg-white dark:text-gray-900 dark:border-white"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                        {!foto.ukuran && (
                          <p className="text-[10px] text-red-500 mt-1 italic">
                            * Wajib memilih 1 ukuran untuk foto ini
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tambah foto — dashed button */}
                <button
                  type="button"
                  onClick={handleAddFoto}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={15} /> Tambah Foto / Ukuran Lainnya
                </button>
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
