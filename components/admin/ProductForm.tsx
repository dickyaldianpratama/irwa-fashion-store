"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  nama: string;
}

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    deskripsi: "",
    hargaAsli: "",
    hargaDiskon: "",
    isPreOrder: false,
    kategoriId: categories[0]?.id || "",
    imageUrl: "",
  });

  const [varians, setVarians] = useState([{ warna: "", ukuran: "", stok: "0" }]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "nama") {
      // Auto-generate slug
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      }));
    }
  };

  const handleVarianChange = (index: number, field: string, value: string) => {
    const newVarians = [...varians];
    newVarians[index] = { ...newVarians[index], [field]: value };
    setVarians(newVarians);
  };

  const addVarian = () => {
    setVarians([...varians, { warna: "", ukuran: "", stok: "0" }]);
  };

  const removeVarian = (index: number) => {
    if (varians.length > 1) {
      const newVarians = varians.filter((_, i) => i !== index);
      setVarians(newVarians);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        hargaAsli: parseInt(formData.hargaAsli) || 0,
        hargaDiskon: formData.hargaDiskon ? parseInt(formData.hargaDiskon) : null,
        varians: varians.map(v => ({
          ...v,
          stok: parseInt(v.stok) || 0
        }))
      };

      const res = await fetch("/api/admin/produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk");

      toast.success("Produk berhasil ditambahkan!");
      router.push("/admin/produk");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Produk</label>
            <input required name="nama" value={formData.nama} onChange={handleChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Kemeja Pria" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <select required name="kategoriId" value={formData.kategoriId} onChange={handleChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Deskripsi</label>
          <textarea required name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={4} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Deskripsi lengkap produk..." />
        </div>
      </div>

      {/* Harga & Gambar */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Harga & Gambar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Harga Asli (Rp)</label>
            <input required type="number" name="hargaAsli" value={formData.hargaAsli} onChange={handleChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="100000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Harga Diskon (Opsional)</label>
            <input type="number" name="hargaDiskon" value={formData.hargaDiskon} onChange={handleChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Kosongkan jika tidak diskon" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Link URL Gambar (Wajib)</label>
          <div className="flex gap-3 items-start">
            <div className="flex-1 relative">
              <ImageIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2.5 pl-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="https://contoh.com/gambar.jpg" />
              <p className="text-xs text-gray-500 mt-1">Masukkan link gambar (misal dari postimg.cc, imgur, atau drive). Fitur upload file langsung segera hadir.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Varian */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Varian (Warna & Ukuran)</h2>
          <button type="button" onClick={addVarian} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <Plus size={16} /> Tambah Varian
          </button>
        </div>
        
        <div className="space-y-3">
          {varians.map((varian, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-[120px] space-y-1">
                <label className="text-xs font-medium">Warna</label>
                <input required value={varian.warna} onChange={(e) => handleVarianChange(index, "warna", e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" placeholder="Hitam" />
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <label className="text-xs font-medium">Ukuran</label>
                <input required value={varian.ukuran} onChange={(e) => handleVarianChange(index, "ukuran", e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" placeholder="L / 42" />
              </div>
              <div className="w-[100px] space-y-1">
                <label className="text-xs font-medium">Stok</label>
                <input required type="number" min="0" value={varian.stok} onChange={(e) => handleVarianChange(index, "stok", e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" />
              </div>
              {varians.length > 1 && (
                <button type="button" onClick={() => removeVarian(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button disabled={isLoading} type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70 transition-all">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Simpan Produk"}
        </button>
      </div>
    </form>
  );
}
