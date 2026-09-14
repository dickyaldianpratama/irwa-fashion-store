"use client";

import { useState, useEffect } from "react";
import { Gift, Award, Crown, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const REWARDS = [
  { id: "r1", title: "Voucher Diskon Rp 20.000", cost: 500, type: "discount", color: "bg-blue-500" },
  { id: "r2", title: "Gratis Ongkir s.d Rp 30.000", cost: 800, type: "shipping", color: "bg-emerald-500" },
  { id: "r3", title: "Voucher Diskon Rp 50.000", cost: 1200, type: "discount", color: "bg-purple-500" },
  { id: "r4", title: "Exclusive Merchandise Cap", cost: 2500, type: "merch", color: "bg-rose-500" },
];

export default function PoinPage() {
  const [poinData, setPoinData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPoin();
  }, []);

  const fetchPoin = async () => {
    try {
      const res = await fetch("/api/akun/poin");
      if (res.ok) {
        const { data } = await res.json();
        setPoinData(data);
      }
    } catch (error) {
      console.error("Gagal memuat poin", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (!poinData || poinData.saldo < reward.cost) {
      toast.error("Poin Anda tidak mencukupi untuk reward ini.");
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await fetch("/api/akun/poin/tukar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cost: reward.cost, reward: reward }),
      });

      const { data, error } = await res.json();
      if (!res.ok) throw new Error(error);

      // Update UI
      setPoinData(data);
      toast.custom((t) => (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-4 flex gap-3 max-w-sm animate-fade-in">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Reward Berhasil Ditukar!</h4>
            <p className="text-xs text-gray-500 mt-0.5">Voucher <b>{reward.title}</b> telah ditambahkan ke akun Anda.</p>
          </div>
        </div>
      ));
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menukar poin");
    } finally {
      setRedeemingId(null);
    }
  };

  // Helper untuk Level
  const getLevelStyle = (level: string) => {
    switch (level) {
      case "SILVER": return "bg-gray-300 text-gray-800";
      case "GOLD": return "bg-yellow-400 text-yellow-900";
      case "PLATINUM": return "bg-slate-800 text-white";
      case "BRONZE":
      default: return "bg-amber-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Memuat data membership...</p>
      </div>
    );
  }

  // Jika tidak ada data poin, kita kasih default 0
  const saldo = poinData?.saldo || 0;
  
  // Kalkulasi Level Member Dinamis
  let currentLevel = "BRONZE";
  let nextLevel = "SILVER";
  let pointsNeeded = 1000 - saldo;

  if (saldo >= 5000) {
    currentLevel = "PLATINUM";
    nextLevel = "MAX";
    pointsNeeded = 0;
  } else if (saldo >= 2500) {
    currentLevel = "GOLD";
    nextLevel = "PLATINUM";
    pointsNeeded = 5000 - saldo;
  } else if (saldo >= 1000) {
    currentLevel = "SILVER";
    nextLevel = "GOLD";
    pointsNeeded = 2500 - saldo;
  }

  const level = currentLevel;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Award className="text-primary" /> IRWA Club Rewards
        </h1>
        <p className="text-gray-500 text-sm">
          Kumpulkan poin dari setiap pembelian dan tukarkan dengan voucher eksklusif.
        </p>
      </div>

      {/* Kartu Member */}
      <div 
        className="relative overflow-hidden text-white rounded-2xl p-6 sm:p-8 shadow-2xl mb-10 border border-white/30"
        style={{ backgroundImage: "url('/images/background.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Efek Kaca (Glassmorphism Overlay) */}
        {/* Tint transparan agar teks terbaca, tanpa blur */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Pantulan Kaca Mengkilap (Glossy Reflection) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>
        
        {/* Bayangan Dalam (Inner Highlight) untuk efek 3D miniatur dalam kaca */}
        <div className="absolute inset-0 shadow-[inset_0_1px_3px_rgba(255,255,255,0.6)] rounded-2xl pointer-events-none"></div>
        
        {/* Cahaya Linear / Dekorasi */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-2xl z-0 pointer-events-none mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Poin Aktif</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">{saldo.toLocaleString("id-ID")}</span>
              <span className="text-primary font-bold text-lg mb-1">Pts</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <p className="text-gray-400 font-medium text-sm mb-2 uppercase tracking-wider">Status Membership</p>
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold shadow-lg ${getLevelStyle(level)}`}>
              <Crown size={18} /> {level} MEMBER
            </div>
            {level === "BRONZE" && (
              <p className="text-xs text-gray-400 mt-3 text-right">
                Kumpulkan <span className="text-white font-bold">{(1000 - saldo) > 0 ? 1000 - saldo : 0}</span> poin lagi untuk naik ke SILVER.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Hadiah (Rewards) */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Sparkles className="text-amber-500" size={20} /> Tukar Poinmu Sekarang
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {REWARDS.map((reward) => {
            const isAffordable = saldo >= reward.cost;
            
            return (
              <div key={reward.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 transition-all hover:border-primary/30 hover:shadow-md">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white shrink-0 ${reward.color}`}>
                  <Gift size={28} />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{reward.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 font-medium">Butuh: <span className="text-primary font-bold">{reward.cost} Poin</span></p>
                  
                  <button 
                    onClick={() => handleRedeem(reward)}
                    disabled={!isAffordable || redeemingId === reward.id}
                    className={`mt-auto w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
                      ${isAffordable 
                        ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                    `}
                  >
                    {redeemingId === reward.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : !isAffordable ? (
                      <>Poin Kurang</>
                    ) : (
                      <>Tukar Sekarang</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Tambahan */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mt-8">
        <AlertCircle size={20} className="text-blue-500 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Cara Mendapatkan Poin</p>
          <p>Anda akan mendapatkan <b>1 Poin</b> untuk setiap pembelanjaan <b>Rp 1.000</b> (Berlaku kelipatan). Poin akan otomatis ditambahkan setelah pesanan berstatus Selesai.</p>
        </div>
      </div>
    </div>
  );
}
