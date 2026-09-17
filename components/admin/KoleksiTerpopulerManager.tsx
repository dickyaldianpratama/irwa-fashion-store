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

const emptyData = { title: "", image: "", link: "", urutan: "0" };

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
    setFormData({
      title: item.title,
      image: item.image,
      link: item.link || "",
      urutan: item.urutan.toString()
    });
    setShowModal(true);
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
        body: JSON.stringify({ ...formData, id: editingId }),
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
          <div key={item.id} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative w-full aspect-[4/5] bg-gray-100">
              <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                Urutan: {item.urutan}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                {item.link && <p className="text-xs text-blue-500 truncate mt-1">{item.link}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="flex-1 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                  {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Hapus
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
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <h3 className="font-bold">{editingId ? "Edit Koleksi" : "Tambah Koleksi"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul / Title</label>
                <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="w-full p-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg" placeholder="Misal: Koleksi Lebaran" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link URL (Opsional)</label>
                <input value={formData.link} onChange={e => setFormData(p => ({...p, link: e.target.value}))} className="w-full p-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg" placeholder="/kategori/kemeja" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urutan Tampil (Angka)</label>
                <input type="number" value={formData.urutan} onChange={e => setFormData(p => ({...p, urutan: e.target.value}))} className="w-full p-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg" />
              </div>
              <div>
                <ImageUploader value={formData.image} onChange={url => setFormData(p => ({...p, image: url}))} folder="koleksi" label="Gambar Banner" aspectRatio="aspect-[4/5]" />
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-800 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}