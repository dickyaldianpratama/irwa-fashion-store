"use client";

import { useState } from "react";
import { Plus, MapPin, Trash2, Edit2, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AlamatPage() {
  const [addresses, setAddresses] = useState([
    { id: 1, title: "Rumah", detail: "Jl. Sudirman No. 123, Jakarta Selatan", phone: "081234567890", isUtama: true },
    { id: 2, title: "Kantor", detail: "Gedung Cyber Lt. 5, Kuningan, Jakarta Selatan", phone: "081987654321", isUtama: false }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr = {
      id: Date.now(),
      title: newTitle,
      detail: newDetail,
      phone: newPhone,
      isUtama: addresses.length === 0
    };
    setAddresses([...addresses, newAddr]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDetail("");
    setNewPhone("");
    toast.success("Alamat baru berhasil ditambahkan!");
  };

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success("Alamat berhasil dihapus.");
  };

  const handleSetUtama = (id: number) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isUtama: a.id === id
    })));
    toast.success("Alamat utama berhasil diubah.");
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Alamat</h1>
          <p className="text-gray-500 text-sm">Kelola alamat pengiriman Anda untuk mempermudah proses checkout.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Alamat
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`p-5 rounded-2xl border transition-all ${addr.isUtama ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 bg-white hover:border-primary/30'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${addr.isUtama ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{addr.title}</h3>
                    {addr.isUtama && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Utama</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 max-w-xl leading-relaxed">{addr.detail}</p>
                  <p className="text-sm text-gray-500 font-medium">{addr.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                {!addr.isUtama && (
                  <button onClick={() => handleSetUtama(addr.id)} className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20">
                    Jadikan Utama
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
            <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Belum Ada Alamat</h3>
            <p className="text-sm text-gray-500 mb-4">Kamu belum menambahkan alamat pengiriman.</p>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors">
              <Plus size={18} /> Tambah Alamat Sekarang
            </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
      >
        <Plus size={18} /> Tambah Alamat Baru
      </button>

      {/* Modal Tambah Alamat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Tambah Alamat Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-white rounded-full shadow-sm border border-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 bg-white flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Simpan Sebagai (Contoh: Kosan)</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm transition-colors focus:ring-4 focus:ring-primary/10" placeholder="Masukkan nama alamat" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea required value={newDetail} onChange={(e) => setNewDetail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary h-28 resize-none text-sm transition-colors focus:ring-4 focus:ring-primary/10" placeholder="Nama jalan, gedung, no. rumah, kecamatan, kota..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Handphone (WhatsApp)</label>
                <input type="tel" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm transition-colors focus:ring-4 focus:ring-primary/10" placeholder="08xxxxxxxxx" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
