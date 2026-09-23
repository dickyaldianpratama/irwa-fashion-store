"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Loader2, X, Layers } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export interface KoleksiImageItem {
  id: string;
  image: string;
  ukuran: string[];
  stok?: number;
}

export interface Koleksi {
  id: string;
  title: string;
  image: string;
  itemsData?: string | null;
  link: string | null;
  urutan: number;
  hargaAsli?: number | null;
  hargaDiskon?: number | null;
  labelPromo?: string | null;
  bestSellerBadge?: string | null;
  badgeGaransi?: string | null;
  rating?: string | null;
  terjual?: string | null;
  ukuran?: string | null;
  stok?: number | null;
}

export function parseKoleksiItems(item: Koleksi): KoleksiImageItem[] {
  if (item.itemsData) {
    try {
      const parsed = JSON.parse(item.itemsData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, idx) => ({
          id: p.id || `item-${idx + 1}`,
          image: p.image || "",
          ukuran:
            Array.isArray(p.ukuran) && p.ukuran.length > 0
              ? [p.ukuran[0]]
              : typeof p.ukuran === "string" && p.ukuran
                ? [p.ukuran]
                : [],
          stok: typeof p.stok === "number" ? p.stok : (item.stok ?? 10),
        }));
      }
    } catch (e) {}
  }
  const firstUkuran = item.ukuran
    ? item.ukuran
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)[0]
    : undefined;
  return [
    {
      id: "item-1",
      image: item.image || "",
      ukuran: firstUkuran ? [firstUkuran] : [],
      stok: item.stok ?? 10,
    },
  ];
}

interface Props {
  koleksi: Koleksi[];
}

const emptyData = {
  title: "",
  items: [
    {
      id: "item-1",
      image: "",
      ukuran: [] as string[],
      stok: 10,
    },
  ] as KoleksiImageItem[],
  link: "",
  urutan: "0",
  hargaAsli: "",
  hargaDiskon: "",
  persenDiskon: "",
  labelPromo: "",
  bestSellerBadge: "",
  badgeGaransi: "",
  rating: "",
  terjual: "",
  stok: "10",
};

export default function KoleksiTerpopulerManager({ koleksi }: Props) {
  const [items, setItems] = useState<Koleksi[]>(koleksi);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyData);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      ...emptyData,
      items: [
        {
          id: `item-${Date.now()}`,
          image: "",
          ukuran: [],
          stok: 10,
        },
      ],
      stok: "10",
    });
    setShowModal(true);
  };

  const openEdit = (item: Koleksi) => {
    setEditingId(item.id);

    let initialPersen = "";
    if (item.hargaAsli && item.hargaDiskon) {
      if (item.hargaAsli > item.hargaDiskon) {
        initialPersen = Math.round(
          ((item.hargaAsli - item.hargaDiskon) / item.hargaAsli) * 100,
        ).toString();
      }
    }

    const parsedItems = parseKoleksiItems(item);
    const totalStok = parsedItems.reduce((acc, curr) => acc + (curr.stok || 0), 0);

    setFormData({
      title: item.title,
      items:
        parsedItems.length > 0
          ? parsedItems
          : [
              {
                id: `item-${Date.now()}`,
                image: "",
                ukuran: [],
                stok: 10,
              },
            ],
      link: item.link || "",
      urutan: item.urutan.toString(),
      hargaAsli: item.hargaAsli ? item.hargaAsli.toString() : "",
      hargaDiskon: item.hargaDiskon ? item.hargaDiskon.toString() : "",
      persenDiskon: initialPersen,
      labelPromo: item.labelPromo || "",
      bestSellerBadge: item.bestSellerBadge || "",
      badgeGaransi: item.badgeGaransi || "",
      rating: item.rating || "",
      terjual: item.terjual || "",
      stok: item.stok !== null && item.stok !== undefined ? item.stok.toString() : totalStok.toString(),
    });
    setShowModal(true);
  };

  const handleAddItem = () => {
    setFormData((prev) => {
      const newItems = [
        ...prev.items,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          image: "",
          ukuran: [],
          stok: 10,
        },
      ];
      const totalStok = newItems.reduce((acc, curr) => acc + (curr.stok || 0), 0);
      return {
        ...prev,
        items: newItems,
        stok: totalStok.toString(),
      };
    });
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      toast.error("Minimal harus ada 1 foto pakaian");
      return;
    }
    setFormData((prev) => {
      const newItems = prev.items.filter((item) => item.id !== id);
      const totalStok = newItems.reduce((acc, curr) => acc + (curr.stok || 0), 0);
      return {
        ...prev,
        items: newItems,
        stok: totalStok.toString(),
      };
    });
  };

  const handleItemImageChange = (id: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, image: url } : item,
      ),
    }));
  };

  const handleSetItemSize = (id: string, size: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ukuran: [size] } : item,
      ),
    }));
  };

  const handleItemStokChange = (id: string, val: string) => {
    const num = val === "" ? undefined : Math.max(0, parseInt(val) || 0);
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === id ? { ...item, stok: num } : item,
      );
      const totalStok = updatedItems.reduce((acc, curr) => acc + (curr.stok || 0), 0);
      return {
        ...prev,
        items: updatedItems,
        stok: totalStok.toString(),
      };
    });
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "hargaAsli" || name === "persenDiskon") {
      const asli =
        parseInt(name === "hargaAsli" ? value : formData.hargaAsli) || 0;
      const persen =
        parseInt(name === "persenDiskon" ? value : formData.persenDiskon) || 0;

      if (asli > 0 && persen > 0 && persen <= 100) {
        const potongan = Math.floor((asli * persen) / 100);
        newFormData.hargaDiskon = (asli - potongan).toString();
      } else {
        newFormData.hargaDiskon = "";
      }
    }
    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Judul / Nama Pakaian wajib diisi");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Minimal harus ada 1 foto pakaian");
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const itm = formData.items[i];
      if (!itm.image) {
        toast.error(`Foto #${i + 1} belum diupload gambarnya`);
        return;
      }
      if (!itm.ukuran || itm.ukuran.length !== 1) {
        toast.error(`Pilih 1 ukuran untuk Foto #${i + 1}`);
        return;
      }
    }

    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch("/api/admin/koleksi-terpopuler", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: formData.title,
          items: formData.items,
          link: formData.link || null,
          urutan: formData.urutan,
          hargaAsli: formData.hargaAsli ? parseInt(formData.hargaAsli) : null,
          hargaDiskon: formData.hargaDiskon
            ? parseInt(formData.hargaDiskon)
            : null,
          labelPromo: formData.labelPromo || null,
          bestSellerBadge: formData.bestSellerBadge || null,
          badgeGaransi: formData.badgeGaransi || null,
          rating: formData.rating || null,
          terjual: formData.terjual || null,
          stok: formData.stok ? parseInt(formData.stok) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      if (isEdit) {
        setItems((prev) =>
          prev
            .map((item) => (item.id === editingId ? data.data : item))
            .sort((a, b) => a.urutan - b.urutan),
        );
      } else {
        setItems((prev) =>
          [...prev, data.data].sort((a, b) => a.urutan - b.urutan),
        );
      }

      toast.success(isEdit ? "Berhasil diperbarui" : "Berhasil ditambahkan");
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Koleksi) => {
    const result = await MySwal.fire({
      title: "Hapus Koleksi?",
      html: `Apakah Anda yakin ingin menghapus koleksi <b>${item.title}</b>?`,
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

    setDeletingId(item.id);
    try {
      const res = await fetch("/api/admin/koleksi-terpopuler", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) throw new Error("Gagal menghapus");

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 select-none font-sans">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} /> Tambah Koleksi Banner
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {(() => {
              const parsed = parseKoleksiItems(item);
              return (
                <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800/80 overflow-hidden">
                  <Image
                    src={parsed[0]?.image || item.image}
                    alt={item.title}
                    fill
                    className="object-cover text-transparent transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xs z-10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Urutan {item.urutan}
                  </div>

                  {parsed.length > 1 && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10 shadow-2xs">
                      <Layers size={10} /> {parsed.length} Foto
                    </div>
                  )}

                  {item.bestSellerBadge && (
                    <div className="absolute top-0 right-0 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md z-10 transform origin-top-right">
                      <Image
                        src={item.bestSellerBadge}
                        alt="Best Seller"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="mt-1.5 flex flex-col font-mono">
                  {item.hargaDiskon ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        Rp {item.hargaAsli?.toLocaleString("id-ID")}
                      </span>
                      <span className="font-black text-sm text-red-600 tracking-tight">
                        Rp {item.hargaDiskon.toLocaleString("id-ID")}
                      </span>
                    </>
                  ) : item.hargaAsli ? (
                    <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">
                      Rp {item.hargaAsli.toLocaleString("id-ID")}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic font-sans">
                      Harga belum diatur
                    </span>
                  )}
                </div>

                {/* Rincian Stok per Foto/Ukuran */}
                {(() => {
                  const parsedItems = parseKoleksiItems(item);
                  return (
                    <div className="mt-2.5 space-y-1.5 bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-200/70 dark:border-gray-800/80 text-xs">
                      <p className="font-bold text-gray-500 dark:text-gray-400 text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Stok per Foto & Ukuran:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedItems.map((pi, pidx) => {
                          const pStok = pi.stok ?? 0;
                          return (
                            <span
                              key={pi.id || pidx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border font-mono ${
                                pStok === 0
                                  ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold"
                                  : pStok <= 5
                                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              <span>Size {pi.ukuran[0] || "-"}:</span>
                              <span>{pStok === 0 ? "Habis" : `${pStok} pcs`}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {item.stok !== null && item.stok !== undefined && (
                  <div className="mt-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-between">
                    <span>Total Stok:</span>
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        item.stok === 0
                          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400 font-black"
                          : item.stok <= 5
                            ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                      }`}
                    >
                      {item.stok === 0 ? "HABIS (0 pcs)" : `${item.stok} pcs`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  title="Hapus Koleksi"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed dark:border-gray-800 text-xs font-medium">
            Belum ada koleksi terpopuler. Tambahkan sekarang!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 shrink-0">
              <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                {editingId ? "Edit Koleksi" : "Tambah Koleksi"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Judul / Nama Pakaian *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                  placeholder="Kemeja Premium..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Harga Asli (Rp) - Opsional
                  </label>
                  <input
                    type="number"
                    name="hargaAsli"
                    value={formData.hargaAsli}
                    onChange={handleHargaChange}
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                    placeholder="Contoh: 150000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Diskon (%) - Harga Coret
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="persenDiskon"
                      value={formData.persenDiskon}
                      onChange={handleHargaChange}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                      placeholder="Contoh: 20"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {formData.hargaDiskon && (
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 p-2.5 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <span>Sistem Pintar Otomatis:</span>
                  <span className="font-mono font-bold">
                    Harga Akhir = Rp{" "}
                    {parseInt(formData.hargaDiskon).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Label Promo (Teks Bebas) - Opsional
                </label>
                <input
                  type="text"
                  value={formData.labelPromo}
                  onChange={(e) =>
                    setFormData({ ...formData, labelPromo: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                  placeholder="Contoh: Beli 2 Gratis 1, Flash Sale"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.urutan}
                    onChange={(e) =>
                      setFormData({ ...formData, urutan: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Teks Garansi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.badgeGaransi}
                    onChange={(e) =>
                      setFormData({ ...formData, badgeGaransi: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                    placeholder="Contoh: Garansi Harga Terbaik"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Rating (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                    placeholder="Contoh: 4.8"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Terjual (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.terjual}
                    onChange={(e) =>
                      setFormData({ ...formData, terjual: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                    placeholder="Contoh: 10RB+ terjual"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Total Stok Barang (pcs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stok}
                  onChange={(e) =>
                    setFormData({ ...formData, stok: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:bg-white focus:dark:bg-gray-900 outline-none transition-all"
                  placeholder="Otomatis dihitung dari jumlah stok foto"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  * Otomatis terakumulasi dari masing-masing stok foto pakaian di bawah.
                </p>
              </div>

              {/* Daftar Foto & Ukuran Pakaian */}
              <div className="space-y-3 pt-3 border-t dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Layers size={14} className="text-primary" />
                      Daftar Foto & Ukuran Pakaian ({formData.items.length})
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Setiap foto pakaian wajib memiliki pilihan ukuran masing-masing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus size={14} /> Tambah Foto
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-200/80 dark:border-gray-700/70 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {idx === 0 ? "Foto #1 (Cover Utama)" : `Foto Pakaian #${idx + 1}`}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Hapus foto ini"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      {/* Image Uploader */}
                      <ImageUploader
                        value={item.image}
                        onChange={(url) => handleItemImageChange(item.id, url)}
                        folder="koleksi"
                        label={`Upload Foto ${idx === 0 ? "Utama" : `#${idx + 1}`} *`}
                        aspectRatio="aspect-[4/5]"
                        compact
                        previewHeight="h-28"
                      />

                      {/* Ukuran untuk foto ini */}
                      <div className="pt-1">
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                          Pilih Ukuran Foto Ini (Wajib 1 Ukuran per Foto):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {["S", "M", "L", "XL", "XXL"].map((size) => {
                            const checked = item.ukuran[0] === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSetItemSize(item.id, size)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  checked
                                    ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                        {(!item.ukuran || item.ukuran.length === 0) && (
                          <p className="text-[10px] text-red-500 mt-1 italic">
                            * Wajib memilih 1 ukuran untuk foto ini
                          </p>
                        )}
                      </div>

                      {/* Stok untuk foto ini */}
                      <div className="pt-2 border-t border-gray-200/70 dark:border-gray-700/70">
                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          Stok Pakaian Foto Ini:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={item.stok ?? ""}
                            onChange={(e) => handleItemStokChange(item.id, e.target.value)}
                            placeholder="Contoh: 15"
                            className="w-28 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold font-mono focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-gray-800"
                          />
                          <span className="text-xs text-gray-500 font-medium">pcs</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={15} /> Tambah Foto / Pakaian Lainnya
                </button>
              </div>

              {/* Badge Best Seller */}
              <div className="pt-3 border-t dark:border-gray-800">
                <div className="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <ImageUploader
                    value={formData.bestSellerBadge}
                    onChange={(url) =>
                      setFormData((p) => ({ ...p, bestSellerBadge: url }))
                    }
                    folder="badges"
                    label="Badge Best Seller (Opsional)"
                    aspectRatio="aspect-square"
                    compact
                    previewHeight="h-24"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-800 flex gap-2.5 shrink-0">
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
                {saving && <Loader2 size={14} className="animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
