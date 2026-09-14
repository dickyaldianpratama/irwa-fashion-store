"use client";

import { useState, useEffect } from "react";
import { useSaveMySize, SizeProfile } from "@/hooks/useSaveMySize";
import { Ruler, Info, Save, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function UkuranSayaPage() {
  const { profile, saveProfile, hasProfile } = useSaveMySize();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state untuk form
  const [formData, setFormData] = useState<SizeProfile>({
    tinggiBadan: "",
    beratBadan: "",
    lingkarDada: "",
    lingkarPinggang: "",
    lebarBahu: "",
    panjangLengan: "",
  });

  useEffect(() => {
    setMounted(true);
    // Sinkronisasi data dari Database asli
    const fetchSizeFromDB = async () => {
      try {
        const res = await fetch("/api/akun/ukuran");
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            // Ubah null jadi string kosong agar input tidak error
            const formattedData = {
              tinggiBadan: data.tinggiBadan?.toString() || "",
              beratBadan: data.beratBadan?.toString() || "",
              lingkarDada: data.lingkarDada?.toString() || "",
              lingkarPinggang: data.lingkarPinggang?.toString() || "",
              lebarBahu: data.lebarBahu?.toString() || "",
              panjangLengan: data.panjangLengan?.toString() || "",
            };
            setFormData(formattedData);
            saveProfile(formattedData); // Sinkronkan DB ke LocalStorage
          }
        }
      } catch (error) {
        console.error("Gagal menarik data ukuran", error);
      }
    };

    fetchSizeFromDB();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Hanya izinkan angka
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/akun/ukuran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan ke server database.");
      }

      // Jika berhasil di DB, simpan juga ke Zustand (Local Storage) untuk caching frontend
      saveProfile(formData);
      toast.success("Profil Ukuran Tubuh berhasil disimpan di Database!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ruler className="text-primary" /> Save My Size
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Lengkapi data ukuran tubuh Anda untuk mendapatkan rekomendasi <strong>"Ukuran Cocok"</strong> secara otomatis di setiap produk.
        </p>
      </div>

      {hasProfile && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800">
          <CheckCircle2 className="flex-shrink-0 mt-0.5 text-green-600" />
          <div>
            <h4 className="font-bold text-sm">Profil Ukuran Aktif!</h4>
            <p className="text-xs mt-1">Sistem kami sekarang akan memandu Anda menemukan ukuran yang paling pas saat berbelanja.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input Kiri */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tinggi Badan (cm)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="tinggiBadan"
                      value={formData.tinggiBadan}
                      onChange={handleChange}
                      placeholder="Contoh: 175"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Berat Badan (kg)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="beratBadan"
                      value={formData.beratBadan}
                      onChange={handleChange}
                      placeholder="Contoh: 70"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lingkar Dada (cm)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="lingkarDada"
                      value={formData.lingkarDada}
                      onChange={handleChange}
                      placeholder="Contoh: 95"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lingkar Pinggang (cm)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="lingkarPinggang"
                      value={formData.lingkarPinggang}
                      onChange={handleChange}
                      placeholder="Contoh: 82"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lebar Bahu (cm)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="lebarBahu"
                      value={formData.lebarBahu}
                      onChange={handleChange}
                      placeholder="Contoh: 44"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Panjang Lengan (cm)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="panjangLengan"
                      value={formData.panjangLengan}
                      onChange={handleChange}
                      placeholder="Contoh: 62"
                      required
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    {hasProfile ? "Perbarui Ukuran" : "Simpan Ukuran"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panduan Kanan */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-3">
              <Info size={18} />
              Panduan Pengukuran
            </h3>
            <ul className="space-y-3 text-sm text-blue-900/80">
              <li>
                <strong className="text-blue-900 block">Lingkar Dada:</strong>
                Ukur mengelilingi bagian dada yang paling penuh, tepat di bawah ketiak.
              </li>
              <li>
                <strong className="text-blue-900 block">Lingkar Pinggang:</strong>
                Ukur mengelilingi pinggang natural Anda, biasanya di atas pusar.
              </li>
              <li>
                <strong className="text-blue-900 block">Lebar Bahu:</strong>
                Ukur dari ujung tulang bahu kiri melewati tengkuk hingga ujung bahu kanan.
              </li>
              <li>
                <strong className="text-blue-900 block">Panjang Lengan:</strong>
                Ukur dari ujung tulang bahu memanjang ke bawah hingga pergelangan tangan.
              </li>
            </ul>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start gap-3">
            <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-xs text-gray-600 leading-relaxed">
              Gunakan pita ukur (meteran baju) yang fleksibel. Pastikan pita tidak terlalu ketat atau kendur saat mengukur untuk hasil paling akurat.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
