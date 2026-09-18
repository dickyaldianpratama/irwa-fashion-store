"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

interface Varian {
  id?: string;
  warna: string;
  ukuran: string;
  stok: string | number;
}

interface ProductFormProps {
  categories: { id: string; nama: string }[];
  initialData?: any;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData;

  // Calculate initial discount percentage
  let initialPersen = "";
  if (initialData?.hargaAsli && initialData?.hargaDiskon) {
    const asli = parseInt(initialData.hargaAsli);
    const diskon = parseInt(initialData.hargaDiskon);
    if (asli > diskon) {
      initialPersen = Math.round(((asli - diskon) / asli) * 100).toString();
    }
  }

  const [formData, setFormData] = useState({
    nama: initialData?.nama || "",
    slug: initialData?.slug || "",
    deskripsi: initialData?.deskripsi || "",
    hargaAsli: initialData?.hargaAsli?.toString() || "",
    hargaDiskon: initialData?.hargaDiskon?.toString() || "",
    persenDiskon: initialPersen,
    labelPromo: initialData?.labelPromo || "",
    isPreOrder: initialData?.isPreOrder || false,
    kategoriId: initialData?.kategoriId || (categories[0]?.id || ""),
    imageUrl: initialData?.images?.[0]?.url || "",
  });

  const [varians, setVarians] = useState<Varian[]>(
    initialData?.varian?.length > 0 
      ? initialData.varian.map((v: any) => ({ ...v, stok: v.stok.toString() }))
      : [{ warna: "", ukuran: "", stok: "0" }]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "nama" && !isEdit) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      }));
    }
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    // Auto calculate diskon
    if (name === "hargaAsli" || name === "persenDiskon") {
      const asli = parseInt(name === "hargaAsli" ? value : formData.hargaAsli) || 0;
      const persen = parseInt(name === "persenDiskon" ? value : formData.persenDiskon) || 0;
      
      if (asli > 0 && persen > 0 && persen <= 100) {
        const potongan = Math.floor((asli * persen) / 100);
        newFormData.hargaDiskon = (asli - potongan).toString();
      } else {
        newFormData.hargaDiskon = ""; // reset jika persen kosong atau 0
      }
    }
    
    setFormData(newFormData);
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
          id: v.id,
          warna: v.warna,
          ukuran: v.ukuran,
          stok: parseInt(v.stok as string) || 0
        }))
      };

      const endpoint = isEdit ? `/api/admin/produk/${initialData.id}` : "/api/admin/produk";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk");

      toast.success(isEdit ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
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
        <h2 className="text-lg font-semibold border-b pb-2">Harga & Promo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Harga Asli (Rp)</label>
            <input required type="number" name="hargaAsli" value={formData.hargaAsli} onChange={handleHargaChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="100000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Diskon (%) - Harga Coret Opsional</label>
            <div className="relative">
              <input type="number" min="0" max="100" name="persenDiskon" value={formData.persenDiskon} onChange={handleHargaChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Contoh: 20" />
              <span className="absolute right-4 top-2.5 font-bold text-gray-400">%</span>
            </div>
            {formData.hargaDiskon && (
              <p className="text-xs text-success font-medium mt-1">
                Sistem Pintar: Harga Akhir = Rp {parseInt(formData.hargaDiskon).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Label Promo (Teks Bebas) - Opsional</label>
          <input type="text" name="labelPromo" value={formData.labelPromo} onChange={handleChange} className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Contoh: Beli 2 Gratis 1, Cashback 10%" />
          <p className="text-xs text-gray-500">Label ini akan muncul sebagai badge di atas gambar produk.</p>
        </div>
        
        <div className="space-y-2">
          <ImageUploader 
            value={formData.imageUrl} 
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
            folder="produk"
            label="Gambar Produk (Wajib)"
            aspectRatio="aspect-square"
          />
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
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isEdit ? "Simpan Perubahan" : "Simpan Produk")}
        </button>
      </div>
    </form>
  );
}
