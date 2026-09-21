"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, X, Loader2, Check, Star } from "lucide-react";
import { toast } from "react-hot-toast";

interface Address {
  id: string;
  title: string;
  detail: string;
  phone: string;
  penerima?: string;
  isUtama: boolean;
}

export default function AlamatPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newPenerima, setNewPenerima] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/akun/alamat", { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        setAddresses(result.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat alamat:", err);
      toast.error("Gagal memuat daftar alamat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetail.trim() || !newPhone.trim()) {
      toast.error("Mohon lengkapi semua bidang alamat");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/akun/alamat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          penerima: newPenerima.trim() || undefined,
          detail: newDetail.trim(),
          phone: newPhone.trim(),
          isUtama: addresses.length === 0,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan alamat baru");
      }

      toast.success("Alamat baru berhasil ditambahkan!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewPenerima("");
      setNewDetail("");
      setNewPhone("");
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    const id = addressToDelete.id;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/akun/alamat/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus alamat");

      toast.success("Alamat berhasil dihapus");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setAddressToDelete(null);
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus alamat");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetUtama = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/akun/alamat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUtama: true }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengubah alamat utama");

      toast.success("Alamat utama berhasil diubah");
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Alamat</h1>
          <p className="text-gray-500 text-sm">
            Kelola alamat pengiriman Anda untuk mempermudah proses checkout.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} /> Tambah Alamat
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-gray-100 bg-white animate-pulse space-y-3"
            >
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-3/4 h-3 bg-gray-100 rounded" />
              <div className="w-1/3 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => {
            const isProcessing = actionId === addr.id;

            return (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all ${
                  addr.isUtama
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        addr.isUtama
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{addr.title}</h3>
                        {addr.isUtama && (
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <Star size={10} className="fill-primary" /> Utama
                          </span>
                        )}
                      </div>
                      {addr.penerima && (
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          Penerima: {addr.penerima}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-1 max-w-xl leading-relaxed">
                        {addr.detail}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">{addr.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    {!addr.isUtama && (
                      <button
                        onClick={() => handleSetUtama(addr.id)}
                        disabled={isProcessing}
                        className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? "Menyimpan..." : "Jadikan Utama"}
                      </button>
                    )}
                    <button
                      onClick={() => setAddressToDelete(addr)}
                      disabled={isProcessing}
                      className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200 cursor-pointer disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {addresses.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Belum Ada Alamat</h3>
              <p className="text-sm text-gray-500 mb-4">
                Kamu belum menambahkan alamat pengiriman.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <Plus size={18} /> Tambah Alamat Sekarang
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 cursor-pointer"
      >
        <Plus size={18} /> Tambah Alamat Baru
      </button>

      {/* Modal Tambah Alamat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Tambah Alamat Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-5 overflow-y-auto space-y-4 bg-white flex-1"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Label Alamat (Contoh: Rumah / Kantor / Kosan)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm transition-colors focus:ring-4 focus:ring-primary/10"
                  placeholder="Masukkan nama label alamat"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Penerima (Opsional)
                </label>
                <input
                  type="text"
                  value={newPenerima}
                  onChange={(e) => setNewPenerima(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm transition-colors focus:ring-4 focus:ring-primary/10"
                  placeholder="Nama orang yang menerima paket"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  required
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary h-28 resize-none text-sm transition-colors focus:ring-4 focus:ring-primary/10"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nomor Handphone (WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm transition-colors focus:ring-4 focus:ring-primary/10"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isSaving ? "Menyimpan ke Database..." : "Simpan Alamat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Alamat (Custom UI Premium & Responsive) */}
      {addressToDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !isDeleting && setAddressToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-gray-100 relative overflow-hidden flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup */}
            <button
              onClick={() => !isDeleting && setAddressToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>

            {/* Icon Trash dengan Glow Halus */}
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 ring-8 ring-red-50/60 shadow-inner">
              <Trash2 size={28} className="stroke-[2.2]" />
            </div>

            {/* Judul & Deskripsi */}
            <h3 className="text-xl font-bold text-gray-900 font-heading mb-1.5">
              Hapus Alamat?
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            {/* Kartu Rincian Alamat yang akan Dihapus */}
            <div className="w-full bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 text-sm">
                  {addressToDelete.title}
                </span>
                {addressToDelete.isUtama && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Star size={9} className="fill-primary" /> Utama
                  </span>
                )}
              </div>
              {addressToDelete.penerima && (
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Penerima: {addressToDelete.penerima}
                </p>
              )}
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {addressToDelete.detail}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {addressToDelete.phone}
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
