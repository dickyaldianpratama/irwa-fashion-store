"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface Koleksi {
  id: string;
  title: string;
  image: string;
  link: string | null;
  urutan: number;
}

interface Props {
  koleksi: Koleksi[];
}

const emptyData = { title: "", image: "", link: "", urutan: "0", hargaAsli: "", hargaDiskon: "", persenDiskon: "" };

export default function KoleksiTerpopulerManager({ koleksi }: Props) {
  const [items, setItems] = useState<Koleksi[]>(koleksi);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyData);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyData);
    setShowModal(true);
  };

  const openEdit = (item: Koleksi) => {
    setEditingId(item.id);
    
    let initialPersen = "";
    if (item.hargaAsli && item.hargaDiskon) {
      if (item.hargaAsli > item.hargaDiskon) {
        initialPersen = Math.round(((item.hargaAsli - item.hargaDiskon) / item.hargaAsli) * 100).toString();
      }
    }

    setFormData({
      title: item.title,
      image: item.image,
      link: item.link || "",
      urutan: item.urutan.toString(),
      hargaAsli: item.hargaAsli?.toString() || "",
      hargaDiskon: item.hargaDiskon?.toString() || "",
      persenDiskon: initialPersen
    });
    setShowModal(true);
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    if (name === "hargaAsli" || name === "persenDiskon") {
      const asli = parseInt(name === "hargaAsli" ? value : formData.hargaAsli) || 0;
      const persen = parseInt(name === "persenDiskon" ? value : formData.persenDiskon) || 0;
      
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
    if (!formData.title || !formData.image) {
      toast.error("Title dan gambar wajib diisi");
      return;
    }
    
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch("/api/admin/koleksi-terpopuler", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          id: editingId,
          hargaAsli: formData.hargaAsli ? parseInt(formData.hargaAsli) : null,
          hargaDiskon: formData.hargaDiskon ? parseInt(formData.hargaDiskon) : null
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      
      if (isEdit) {
        setItems(prev => prev.map(item => item.id === editingId ? data.data : item).sort((a,b) => a.urutan - b.urutan));
      } else {
        setItems(prev => [...prev, data.data].sort((a,b) => a.urutan - b.urutan));
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
      title: 'Hapus Koleksi?',
      html: `Apakah Anda yakin ingin menghapus koleksi <b>${item.title}</b>?`,
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
      const res = await fetch("/api/admin/koleksi-terpopuler", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id })
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast.success("Berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
          <Plus size={18} /> Tambah Koleksi Banner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[16px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative">
            <div className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover text-transparent transition-transform duration-500 group-hover:scale-105" 
                unoptimized 
              />
              <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-100 dark:border-gray-700">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Urutan {item.urutan}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-primary border border-primary/20 bg-primary/5 py-2 rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all">
                  <Edit2 size={15} /> Edit
                </button>
                <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="flex-1 flex items-center justify-center gap-1.5 text-red-600 border border-red-500/20 bg-red-50 dark:bg-red-900/10 py-2 rounded-xl text-sm font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                  {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed dark:border-gray-800">
            Belum ada koleksi terpopuler. Tambahkan sekarang!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 shrink-0">
              <h3 className="font-bold">{editingId ? "Edit Koleksi" : "Tambah Koleksi"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Judul / Nama Pakaian</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Kemeja Premium..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Asli (Rp) - Opsional</label>
                  <input 
                    type="number" 
                    name="hargaAsli"
                    value={formData.hargaAsli}
                    onChange={handleHargaChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Contoh: 150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diskon/Promo (%) - Opsional</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" max="100"
                      name="persenDiskon"
                      value={formData.persenDiskon}
                      onChange={handleHargaChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Contoh: 20"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {formData.hargaDiskon && (
                <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-semibold border border-green-200 flex items-center justify-between">
                  <span>Sistem Pintar Otomatis:</span>
                  <span>Harga Akhir = Rp {parseInt(formData.hargaDiskon).toLocaleString("id-ID")}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Urutan Tampil</label>
                <input 
                  type="number" 
                  value={formData.urutan}
                  onChange={e => setFormData({...formData, urutan: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <ImageUploader value={formData.image} onChange={url => setFormData(p => ({...p, image: url}))} folder="koleksi" label="Gambar Banner" aspectRatio="aspect-[4/5]" />
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-800 flex gap-2 shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-semibold transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}