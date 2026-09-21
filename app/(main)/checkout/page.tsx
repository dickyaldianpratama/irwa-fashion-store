"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Store,
  Scissors,
  CreditCard,
  Trash2,
  Plus,
  X,
  Truck,
  ShieldCheck,
  ChevronRight,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

type DeliveryMode = "DELIVERY" | "PICKUP" | "ALTERATION";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart, removeItem } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("DELIVERY");
  const [isProcessing, setIsProcessing] = useState(false);

  // Vouchers
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // State Alamat
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: "Rumah",
      detail: "Jl. Sudirman No. 123, Jakarta Selatan",
      phone: "081234567890",
      isUtama: true,
    },
    {
      id: 2,
      title: "Kantor",
      detail: "Gedung Cyber Lt. 5, Kuningan, Jakarta Selatan",
      phone: "081987654321",
      isUtama: false,
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);

  // Form Alamat Baru
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // O2O Pick-up State
  const [pickupBranch, setPickupBranch] = useState(
    "IFH Jakarta Selatan (Pondok Indah Mall)",
  );
  const [pickupSession, setPickupSession] = useState("Pagi (10-14)");

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/akun/voucher")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVouchers(d.data);
      });

    // Inisialisasi snap.js jika clientKey tersedia
    fetch("/api/midtrans/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg?.clientKey && cfg?.snapScriptUrl) {
          const existingScript = document.getElementById("midtrans-snap-script");
          if (!existingScript) {
            const script = document.createElement("script");
            script.id = "midtrans-snap-script";
            script.src = cfg.snapScriptUrl;
            script.setAttribute("data-client-key", cfg.clientKey);
            script.async = true;
            document.body.appendChild(script);
          }
        }
      })
      .catch((err) => console.warn("Midtrans script loader notice:", err));
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr = {
      id: Date.now(),
      title: newTitle,
      detail: newDetail,
      phone: newPhone,
      isUtama: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setSelectedAddress(newAddr);
    setIsAddingNew(false);
    setIsAddressModalOpen(false);
    toast.success("Alamat baru berhasil ditambahkan!");
  };

  if (!isMounted)
    return <div className="min-h-screen animate-pulse bg-gray-50" />;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-10 h-10 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Login Diperlukan
        </h1>
        <p className="text-gray-500 mb-6">
          Silakan login terlebih dahulu untuk melanjutkan ke halaman checkout.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Keranjang Kosong
        </h1>
        <p className="text-gray-600 mb-8">
          Anda belum memilih produk apapun untuk dicheckout.
        </p>
        <button
          onClick={() => router.push("/#belanja")}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark"
        >
          Belanja Sekarang
        </button>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingCost = deliveryMode === "PICKUP" ? 0 : 25000;
  const alterationCost = deliveryMode === "ALTERATION" ? 35000 : 0;

  let discount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.tipe === "shipping" && shippingCost > 0)
      discount = Math.min(shippingCost, selectedVoucher.nilai);
    else if (selectedVoucher.tipe === "discount")
      discount = selectedVoucher.nilai;
  }

  const total = Math.max(
    0,
    subtotal + shippingCost + alterationCost - discount,
  );

  const handleCheckout = async () => {
    if (deliveryMode === "DELIVERY" && !selectedAddress) {
      toast.error("Silakan tentukan alamat pengiriman terlebih dahulu");
      setIsAddressModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          totalHarga: total,
          tipePengiriman: deliveryMode,
          voucherId: selectedVoucher?.id,
          metodePembayaran: "Midtrans Payment Gateway",
          alamatPengiriman:
            deliveryMode !== "PICKUP"
              ? `${selectedAddress.title}\n${selectedAddress.detail}\n${selectedAddress.phone}`
              : undefined,
          alterasiDetails:
            deliveryMode === "ALTERATION"
              ? {
                  potongPanjang: 5,
                  catatan: "Mohon dirapikan",
                }
              : undefined,
          pickupDetails:
            deliveryMode === "PICKUP"
              ? {
                  lokasi: pickupBranch,
                  waktu: pickupSession,
                }
              : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Gagal melakukan checkout");

      // Cek apakah snap.js popup tersedia di window
      if (result.token && typeof window !== "undefined" && (window as any).snap?.pay) {
        (window as any).snap.pay(result.token, {
          onSuccess: function (snapResult: any) {
            toast.success("Pembayaran Berhasil!");
            clearCart();
            router.push(`/checkout/success?orderId=${result.orderId}`);
          },
          onPending: function (snapResult: any) {
            toast.success("Pesanan Dibuat, Menunggu Pembayaran!");
            clearCart();
            router.push(`/checkout/success?orderId=${result.orderId}`);
          },
          onError: function (snapResult: any) {
            toast.error("Pembayaran gagal diproses.");
            setIsProcessing(false);
          },
          onClose: function () {
            toast("Layar pembayaran ditutup. Anda dapat melanjutkan pembayaran kapan saja.");
            setIsProcessing(false);
          },
        });
      } else if (result.checkoutUrl) {
        // Redirection URL resmi dari Midtrans Snap
        toast.success("Membuka pembayaran Midtrans...");
        clearCart();
        window.location.href = result.checkoutUrl;
      } else {
        toast.success("Pesanan Berhasil Dibuat!");
        clearCart();
        router.push(`/checkout/success?orderId=${result.orderId}`);
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Kolom Kiri */}
        <div className="w-full lg:w-[60%] space-y-8">
          {/* Metode Pengiriman */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                1
              </span>
              Metode Pengiriman
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all ${deliveryMode === "DELIVERY" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="hidden"
                  checked={deliveryMode === "DELIVERY"}
                  onChange={() => setDeliveryMode("DELIVERY")}
                />
                <Truck
                  size={24}
                  className={
                    deliveryMode === "DELIVERY"
                      ? "text-primary"
                      : "text-gray-400"
                  }
                />
                <span className="font-semibold text-sm">Kirim ke Alamat</span>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all ${deliveryMode === "PICKUP" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="hidden"
                  checked={deliveryMode === "PICKUP"}
                  onChange={() => setDeliveryMode("PICKUP")}
                />
                <Store
                  size={24}
                  className={
                    deliveryMode === "PICKUP" ? "text-primary" : "text-gray-400"
                  }
                />
                <span className="font-semibold text-sm">Ambil di Toko</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full absolute -top-2">
                  Gratis Ongkir
                </span>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all ${deliveryMode === "ALTERATION" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="hidden"
                  checked={deliveryMode === "ALTERATION"}
                  onChange={() => setDeliveryMode("ALTERATION")}
                />
                <Scissors
                  size={24}
                  className={
                    deliveryMode === "ALTERATION"
                      ? "text-primary"
                      : "text-gray-400"
                  }
                />
                <span className="font-semibold text-sm">Kirim + Alterasi</span>
              </label>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              {deliveryMode === "DELIVERY" && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-semibold text-gray-800">
                    Alamat Pengiriman
                  </h3>
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-start gap-3">
                    <MapPin className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {selectedAddress.title}
                        </p>
                        {selectedAddress.isUtama && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedAddress.detail}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedAddress.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    Ubah Alamat
                  </button>
                </div>
              )}
              {deliveryMode === "PICKUP" && (
                <div className="space-y-4 animate-fade-in bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-gray-800">
                    Pilih Cabang Pengambilan
                  </h3>
                  <select
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-primary bg-white text-sm"
                  >
                    <option value="IFH Jakarta Selatan (Pondok Indah Mall)">
                      IFH Jakarta Selatan (Pondok Indah Mall)
                    </option>
                    <option value="IFH Jakarta Pusat (Grand Indonesia)">
                      IFH Jakarta Pusat (Grand Indonesia)
                    </option>
                    <option value="IFH Bandung (Paskal 23)">
                      IFH Bandung (Paskal 23)
                    </option>
                  </select>
                  <h3 className="font-semibold text-gray-800 mt-4">
                    Pilih Sesi Pengambilan
                  </h3>
                  <div className="flex gap-3">
                    {["Pagi (10-14)", "Sore (14-18)", "Malam (18-21)"].map(
                      (sesi) => (
                        <label
                          key={sesi}
                          className={`flex-1 text-center py-2 px-1 border rounded-lg cursor-pointer transition-all ${pickupSession === sesi ? "border-primary bg-primary/5 text-primary font-bold" : "border-gray-200 bg-white hover:border-primary text-gray-600"}`}
                        >
                          <input
                            type="radio"
                            name="waktu"
                            className="hidden"
                            checked={pickupSession === sesi}
                            onChange={() => setPickupSession(sesi)}
                          />
                          <span className="text-xs font-medium">{sesi}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              )}
              {deliveryMode === "ALTERATION" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                    Pengerjaan alterasi memakan waktu <b>+2 hari kerja</b>{" "}
                    sebelum dikirim.
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Catatan Alterasi (Hemming)
                  </h3>
                  <textarea
                    placeholder="Contoh: Potong kelim celana 3 cm"
                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-primary h-24 resize-none text-sm"
                  ></textarea>
                </div>
              )}
            </div>
          </section>

          {/* Metode Pembayaran */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  2
                </span>
                Metode Pembayaran
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                <ShieldCheck size={14} className="text-emerald-600" />
                Midtrans Secured
              </span>
            </div>

            <div className="p-5 border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-2xl shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  Midtrans Payment Gateway
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    Semua Metode Tersedia
                  </span>
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Tekan tombol di bawah untuk memilih pembayaran lengkap: <b>QRIS</b> (GoPay/ShopeePay), <b>Virtual Account</b> (BCA, Mandiri, BNI, BRI), <b>Kartu Kredit/Debit</b>, atau <b>Gerai Retail</b> langsung pada layar Midtrans.
                </p>
              </div>

              {/* Preview Opsi Pembayaran */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">QRIS / E-Wallet</p>
                    <p className="text-[10px] text-gray-500">GoPay, ShopeePay</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <span className="text-xl">🏦</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Virtual Account</p>
                    <p className="text-[10px] text-gray-500">BCA, Mandiri, BNI, BRI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Kartu Kredit/Debit</p>
                    <p className="text-[10px] text-gray-500">Visa, Mastercard, JCB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <span className="text-xl">🏪</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Gerai Retail</p>
                    <p className="text-[10px] text-gray-500">Indomaret, Alfamart</p>
                  </div>
                </div>
              </div>

              {/* Tombol Pemicu Layar Midtrans */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 px-5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2 animate-pulse text-sm sm:text-base font-semibold">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghubungkan ke Layar Pembayaran Midtrans...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm sm:text-base">Pilih Metode Pembayaran (Buka Layar Midtrans)</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-gray-400" /> Enkripsi SSL 256-bit
                </span>
                <span>•</span>
                <span>Verifikasi Otomatis</span>
                <span>•</span>
                <span>Midtrans Official</span>
              </div>
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Ringkasan */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-20 relative rounded-md overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img
                      src={
                        item.gambar ||
                        "https://images.unsplash.com/photo-1581655353564-df123a1eb820"
                      }
                      alt={item.nama || "Product"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1581655353564-df123a1eb820";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.nama}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.ukuran && item.ukuran !== "-" && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-gray-700 bg-gray-100/90 px-2 py-0.5 rounded-md border border-gray-200/70">
                          Size: {item.ukuran}
                        </span>
                      )}
                      {item.warna && item.warna !== "-" ? (
                        <span className="inline-flex items-center text-[11px] font-medium text-gray-600 bg-gray-100/90 px-2 py-0.5 rounded-md border border-gray-200/70">
                          Warna: {item.warna}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md backdrop-blur-xs shadow-[0_1px_2px_rgba(16,185,129,0.06)]">
                          <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                          Kualitas Terjamin
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {item.jumlah} x {formatRupiah(item.harga)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Voucher Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">
                  Voucher & Kupon
                </span>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="font-bold">%</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">
                      {selectedVoucher
                        ? selectedVoucher.judul
                        : "Gunakan Voucher / Kupon"}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {selectedVoucher
                        ? "Voucher berhasil dipakai"
                        : "Makin hemat pakai promo"}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {selectedVoucher ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVoucher(null);
                      }}
                      className="text-red-500 text-xs font-bold px-2"
                    >
                      HAPUS
                    </span>
                  ) : (
                    "Pilih >"
                  )}
                </div>
              </button>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Kalkulasi */}
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span
                  className={
                    shippingCost === 0
                      ? "font-bold text-green-600"
                      : "font-medium text-gray-900"
                  }
                >
                  {shippingCost === 0 ? "GRATIS" : formatRupiah(shippingCost)}
                </span>
              </div>
              {alterationCost > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Alterasi Jahit</span>
                  <span className="font-medium text-gray-900">
                    {formatRupiah(alterationCost)}
                  </span>
                </div>
              )}
              {selectedVoucher && discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
            </div>

            <hr className="border-gray-100 mb-4" />

            <div className="flex justify-between items-end mb-5">
              <span className="font-bold text-gray-900">Total Pembayaran</span>
              <div className="flex flex-col items-end">
                {discount > 0 && (
                  <span className="text-sm font-light text-gray-400 line-through decoration-gray-400 mb-0.5">
                    {formatRupiah(subtotal + shippingCost + alterationCost)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            {/* Informasi Gateway */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 text-xs text-gray-600 mb-4 flex items-center justify-between">
              <span className="font-medium text-gray-700">Metode Bayar:</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <ShieldCheck size={14} className="text-primary" /> Midtrans Gateway
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/30 active:scale-[0.99] cursor-pointer"
            >
              {isProcessing ? (
                <span className="animate-pulse flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Membuka Layar Midtrans...
                </span>
              ) : (
                <>
                  <CreditCard size={20} />
                  Bayar Sekarang via Midtrans
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Transaksi diproses dengan aman dengan enkripsi SSL 256-bit.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Voucher */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Pilih Voucher</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 bg-gray-50 flex-1">
              {vouchers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">
                    Tidak ada voucher yang tersedia.
                  </p>
                  <Link
                    href="/akun/poin"
                    className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md"
                  >
                    Tukar Poinmu Sekarang!
                  </Link>
                </div>
              ) : (
                vouchers.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoucher(v);
                      setIsVoucherModalOpen(false);
                      toast.success("Voucher dipasang!");
                    }}
                    className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl flex gap-4 items-center hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center text-lg">
                      %
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {v.judul}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Berlaku s.d{" "}
                        {new Date(v.expiredAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah / Tambah Alamat */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {isAddingNew ? "Tambah Alamat Baru" : "Pilih Alamat Pengiriman"}
              </h3>
              <button
                onClick={() => {
                  if (isAddingNew) setIsAddingNew(false);
                  else setIsAddressModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {isAddingNew ? (
              <form
                onSubmit={handleSaveNewAddress}
                className="p-5 overflow-y-auto space-y-4 bg-white flex-1"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Simpan Sebagai (Contoh: Kosan)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                    placeholder="Masukkan nama alamat"
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
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary h-24 resize-none text-sm"
                    placeholder="Nama jalan, gedung, no. rumah, kecamatan, kota..."
                  ></textarea>
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
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                    placeholder="08xxxxxxxxx"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                  >
                    Simpan & Pilih Alamat
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="p-4 overflow-y-auto space-y-3 bg-gray-50 flex-1">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl bg-white cursor-pointer transition-all ${selectedAddress.id === addr.id ? "border-primary ring-1 ring-primary shadow-sm" : "border-gray-200 hover:border-primary/50"}`}
                    >
                      <input
                        type="radio"
                        name="addressSelect"
                        className="mt-1 text-primary focus:ring-primary h-4 w-4"
                        checked={selectedAddress.id === addr.id}
                        onChange={() => {
                          setSelectedAddress(addr);
                          setIsAddressModalOpen(false);
                          toast.success("Alamat pengiriman diperbarui!");
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">
                            {addr.title}
                          </p>
                          {addr.isUtama && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.detail}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="w-full py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Tambah Alamat Baru
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
