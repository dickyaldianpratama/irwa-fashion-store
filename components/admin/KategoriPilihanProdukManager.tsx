"use client";

import { useState, useEffect } from "react";
import {
  Edit2, Trash2, Plus, Loader2, X, Check,
  ImageIcon, FolderOpen, Package, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function KategoriPilihanProdukManager({ kategoriList }: Props) {
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>(kategoriList[0]?.id || "");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState({
    nama: "", harga: "", hargaDiskon: "", ukuran: "", deskripsi: ""
  });
  const [addImages, setAddImages] = useState<string[]>([]);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    nama: "", harga: "", hargaDiskon: "", ukuran: "", deskripsi: ""
  });
  const [editImages, setEditImages] = useState<string[]>([]);

  const fetchProduk = async (kategoriId: string) => {
    if (!kategoriId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kategori-pilihan-produk?kategoriPilihanId=${kategoriId}`);
      const data = await res.json();
      setProdukList(data.data || []);
    } catch {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduk(selectedKategoriId); }, [selectedKategoriId]);

  // ── IMAGE SLOT HELPERS ──
  const addImageSlot = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => [...prev, ""]);
  const removeImageSlot = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) =>
    setter(prev => prev.filter((_, i) => i !== idx));
  const updateImageSlot = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, url: string) =>
    setter(prev => prev.map((u, i) => i === idx ? url : u));

  // ── ADD PRODUK ──
  const handleAdd = async () => {
    if (!addData.nama.trim() || !addData.harga) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/kategori-pilihan-produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategoriPilihanId: selectedKategoriId,
          nama: addData.nama.trim(),
          harga: Number(addData.harga),
          hargaDiskon: addData.hargaDiskon ? Number(addData.hargaDiskon) : null,
          ukuran: addData.ukuran.trim() || null,
          deskripsi: addData.deskripsi.trim() || null,
          images: addImages.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan");
      setProdukList(prev => [data.data, ...prev]);
      toast.success(`Produk "${addData.nama}" berhasil ditambahkan!`);
      setAddData({ nama: "", harga: "", hargaDiskon: "", ukuran: "", deskripsi: "" });
      setAddImages([]);
      setShowAddModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  // ── EDIT PRODUK ──
  const startEdit = (p: Produk) => {
    setEditingProduk(p);
    setEditData({
      nama: p.nama,
      harga: String(p.harga),
      hargaDiskon: p.hargaDiskon ? String(p.hargaDiskon) : "",
      ukuran: p.ukuran || "",
      deskripsi: p.deskripsi || "",
    });
    setEditImages(p.images.map(img => img.url));
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingProduk) return;
    if (!editData.nama.trim() || !editData.harga) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kategori-pilihan-produk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduk.id,
          nama: editData.nama.trim(),
          harga: Number(editData.harga),
          hargaDiskon: editData.hargaDiskon ? Number(editData.hargaDiskon) : null,
          ukuran: editData.ukuran.trim() || null,
          deskripsi: editData.deskripsi.trim() || null,
          images: editImages.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setProdukList(prev => prev.map(p => p.id === editingProduk.id ? data.data : p));
      toast.success("Produk berhasil diperbarui!");
      setShowEditModal(false);
      setEditingProduk(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE PRODUK ──
  const handleDelete = async (p: Produk) => {
    const result = await MySwal.fire({
      title: 'Hapus Produk?',
      html: `Apakah Anda yakin ingin menghapus <b>${p.nama}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-2xl' }
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
      setProdukList(prev => prev.filter(item => item.id !== p.id));
      toast.success(`Produk "${p.nama}" telah dihapus.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const selectedKategori = kategoriList.find(k => k.id === selectedKategoriId);

  // Reusable form fields for add/edit
  const renderFormFields = (
    data: typeof addData,
    setData: React.Dispatch<React.SetStateAction<typeof addData>>,
    images: string[],
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="p-5 space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nama Produk <span className="text-red-500">*</span></label>
        <input
          value={data.nama}
          onChange={e => setData(p => ({ ...p, nama: e.target.value }))}
          placeholder="Contoh: Celana Jeans Slim Fit"
          className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Harga (Rp) <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={data.harga}
            onChange={e => setData(p => ({ ...p, harga: e.target.value }))}
            placeholder="150000"
            className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Harga Diskon (Rp)</label>
          <input
            type="number"
            value={data.hargaDiskon}
            onChange={e => setData(p => ({ ...p, hargaDiskon: e.target.value }))}
            placeholder="120000"
            className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukuran</label>
        <input
          value={data.ukuran}
          onChange={e => setData(p => ({ ...p, ukuran: e.target.value }))}
          placeholder="S,M,L,XL"
          className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma. Contoh: S,M,L,XL</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Deskripsi</label>
        <textarea
          value={data.deskripsi}
          onChange={e => setData(p => ({ ...p, deskripsi: e.target.value }))}
          placeholder="Bahan, detail produk, dll..."
          rows={3}
          className="w-full p-2.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Multiple Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Foto Produk</label>
          <button
            type="button"
            onClick={() => addImageSlot(setImages)}
            className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Tambah Foto
          </button>
        </div>
        {images.length === 0 && (
          <p className="text-xs text-gray-400">Klik &quot;Tambah Foto&quot; untuk menambahkan gambar produk (pertama = utama)</p>
        )}
        {images.map((url, idx) => (
          <div key={idx} className="mb-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Foto {idx + 1} {idx === 0 ? <span className="text-blue-600 font-bold">(Utama)</span> : ""}</span>
              <button
                type="button"
                onClick={() => removeImageSlot(setImages, idx)}
                className="text-xs text-red-500 hover:underline flex items-center gap-0.5"
              >
                <X size={10} /> Hapus
              </button>
            </div>
            <ImageUploader
              value={url}
              onChange={(newUrl) => updateImageSlot(setImages, idx, newUrl)}
              folder="kategori-produk"
              label={`Foto ${idx + 1}`}
              aspectRatio="aspect-[3/4]"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Kategori Selector */}
      {kategoriList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <FolderOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium">Belum ada Kategori Pilihan</p>
          <p className="text-sm text-gray-400 mt-1">Tambahkan Kategori Pilihan (Home) terlebih dahulu di tab sebelumnya.</p>
        </div>
      ) : (
        <>
          {/* Selector Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Pilih Kategori</label>
                <div className="relative">
                  <select
                    value={selectedKategoriId}
                    onChange={e => setSelectedKategoriId(e.target.value)}
                    className="w-full p-2.5 pr-8 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {kategoriList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setAddData({ nama: "", harga: "", hargaDiskon: "", ukuran: "", deskripsi: "" });
                    setAddImages([]);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Plus size={16} /> Tambah Produk
                </button>
              </div>
            </div>
          </div>

          {/* Product Count Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Memuat..." : `${produkList.length} produk di kategori `}
              {!loading && <span className="font-semibold text-gray-900 dark:text-white">{selectedKategori?.nama}</span>}
            </p>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : produkList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">Belum ada produk di kategori {selectedKategori?.nama}</p>
              <p className="text-sm text-gray-400 mt-1">Klik &quot;Tambah Produk&quot; untuk mulai mengisi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {produkList.map(p => {
                const mainImg = p.images.find(i => i.isUtama)?.url || p.images[0]?.url;
                const isDiskon = p.hargaDiskon && p.hargaDiskon < p.harga;
                return (
                  <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                      {mainImg ? (
                        <img src={mainImg} alt={p.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 gap-1">
                          <ImageIcon size={24} />
                          <span className="text-[10px]">Tanpa Gambar</span>
                        </div>
                      )}
                      {isDiskon && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          DISKON
                        </div>
                      )}
                      {p.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          +{p.images.length - 1} foto
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">{p.nama}</p>
                      <div className="mt-auto">
                        {isDiskon ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">{formatRupiah(p.harga)}</p>
                            <p className="text-sm font-black text-blue-600">{formatRupiah(p.hargaDiskon!)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-black text-gray-900 dark:text-white">{formatRupiah(p.harga)}</p>
                        )}
                        {p.ukuran && <p className="text-[10px] text-gray-400 mt-0.5">{p.ukuran}</p>}
                      </div>
                    </div>
                    <div className="p-2.5 pt-0 flex gap-1.5">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex-1 flex items-center justify-center gap-1 text-blue-600 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={12} /><span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="flex items-center justify-center text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        {deletingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── MODAL TAMBAH ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tambah Produk</h3>
                <p className="text-xs text-gray-500 mt-0.5">Kategori: <span className="font-semibold text-blue-600">{selectedKategori?.nama}</span></p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            {renderFormFields(addData, setAddData, addImages, setAddImages)}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !addData.nama.trim() || !addData.harga}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT ── */}
      {showEditModal && editingProduk && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Produk</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{editingProduk.nama}</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingProduk(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            {renderFormFields(editData, setEditData, editImages, setEditImages)}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
              <button onClick={() => { setShowEditModal(false); setEditingProduk(null); }} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editData.nama.trim() || !editData.harga}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
