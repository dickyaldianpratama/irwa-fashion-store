"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  DollarSign,
  Award,
  Phone,
  Mail,
  MapPin,
  Ruler,
  Calendar,
  Eye,
  X,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Trash2,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  birthDate?: string | null;
  createdAt: string;
  poin: number;
  levelMember: string;
  ukuran?: {
    tinggiBadan?: number | null;
    beratBadan?: number | null;
    lingkarDada?: number | null;
    lingkarPinggang?: number | null;
    lebarBahu?: number | null;
    panjangLengan?: number | null;
  } | null;
  alamatUtama?: {
    penerima: string;
    telepon: string;
    kota: string;
    kodePos: string;
    alamatLengkap: string;
  } | null;
  totalOrders: number;
  allOrdersCount: number;
  totalSpent: number;
  lastOrderDate?: string | null;
  recentOrders: {
    id: string;
    totalHarga: number;
    statusPesanan: string;
    createdAt: string;
  }[];
}

interface AdminPelangganClientProps {
  initialCustomers: CustomerData[];
}

export default function AdminPelangganClient({ initialCustomers }: AdminPelangganClientProps) {
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "spent" | "orders" | "name">("newest");
  
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteCustomer = async (customer: CustomerData) => {
    const result = await MySwal.fire({
      title: "Hapus / Blokir Pelanggan?",
      html: `Apakah Anda yakin ingin menghapus pelanggan <b>${customer.name}</b> (${customer.email}) secara permanen dari database?<br/><br/><span class="text-xs text-red-500 font-semibold">Seluruh data akun, riwayat pesanan, alamat, wishlist, dan poin pelanggan ini akan terhapus otomatis dari database.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Permanen!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl dark:bg-gray-900 dark:text-white",
        title: "dark:text-white",
        htmlContainer: "dark:text-gray-300",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingId(customer.id);
    try {
      const res = await fetch(`/api/admin/pelanggan?id=${customer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus pelanggan");
      }

      toast.success("Pelanggan berhasil dihapus permanen dari database");
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pelanggan");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Sort Logic
  const filteredCustomers = customers
    .filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.alamatUtama && c.alamatUtama.kota.toLowerCase().includes(q));

      const matchesLevel = levelFilter === "ALL" || c.levelMember === levelFilter;

      const matchesActivity =
        activityFilter === "ALL" ||
        (activityFilter === "ACTIVE" && c.totalOrders > 0) ||
        (activityFilter === "INACTIVE" && c.totalOrders === 0);

      return matchesSearch && matchesLevel && matchesActivity;
    })
    .sort((a, b) => {
      if (sortBy === "spent") return b.totalSpent - a.totalSpent;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // KPI Calculations
  const totalCustomersCount = customers.length;
  const activeCustomersCount = customers.filter((c) => c.totalOrders > 0).length;
  const totalCustomerSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.levelMember === "GOLD" || c.levelMember === "PLATINUM").length;

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "PLATINUM":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "GOLD":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "SILVER":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatWhatsAppPhone = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    }
    return clean;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Manajemen Pelanggan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {totalCustomersCount} Akun
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola profil pelanggan, status membership, riwayat pesanan, dan profil ukuran tubuh
          </p>
        </div>
      </div>

      {/* KPI Stats Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Pelanggan
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalCustomersCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
            <Users size={20} strokeWidth={1.8} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pelanggan Aktif
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {activeCustomersCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck size={20} strokeWidth={1.8} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Belanja Pelanggan
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
              {formatRupiah(totalCustomerSpent)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DollarSign size={20} strokeWidth={1.8} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Member VIP (Gold/Plat)
            </p>
            <p className="text-2xl font-bold text-amber-500 mt-1">
              {vipCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
            <Award size={20} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, no HP, kota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Level Member Selector */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">Semua Tier Member</option>
              <option value="BRONZE">Bronze Member</option>
              <option value="SILVER">Silver Member</option>
              <option value="GOLD">Gold Member</option>
              <option value="PLATINUM">Platinum Member</option>
            </select>

            {/* Activity Selector */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">Semua Aktivitas</option>
              <option value="ACTIVE">Pernah Belanja</option>
              <option value="INACTIVE">Belum Belanja</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden"
            >
              <option value="newest">Terbaru Mendaftar</option>
              <option value="spent">Total Belanja Terbanyak</option>
              <option value="orders">Pesanan Terbanyak</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            Tidak ada data pelanggan yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Tier Member</th>
                  <th className="py-3.5 px-4">Saldo Poin</th>
                  <th className="py-3.5 px-4">Transaksi Belanja</th>
                  <th className="py-3.5 px-4">Kota</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-gray-700 dark:text-gray-300">
                {filteredCustomers.map((c) => {
                  const initial = c.name ? c.name.charAt(0).toUpperCase() : "P";
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar size={10} /> Joined{" "}
                              {new Date(c.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-mono text-[11px] text-gray-800 dark:text-gray-200 flex items-center gap-1">
                            <Mail size={11} className="text-gray-400" /> {c.email}
                          </p>
                          {c.phone && c.phone !== "-" && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                                {c.phone}
                              </p>
                              <a
                                href={`https://wa.me/${formatWhatsAppPhone(c.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                title="Hubungi via WhatsApp"
                              >
                                <MessageCircle size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tier Member */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getLevelBadgeClass(
                            c.levelMember
                          )}`}
                        >
                          {c.levelMember}
                        </span>
                      </td>

                      {/* Saldo Poin */}
                      <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {c.poin.toLocaleString("id-ID")} Poin
                      </td>

                      {/* Transaksi & Spent */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatRupiah(c.totalSpent)}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {c.totalOrders} Pesanan Sukses
                        </p>
                      </td>

                      {/* Kota */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                        {c.alamatUtama ? c.alamatUtama.kota : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-xl font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            <Eye size={13} /> Detail
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            disabled={deletingId === c.id}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all inline-flex items-center justify-center disabled:opacity-50"
                            title="Hapus Pelanggan"
                          >
                            {deletingId === c.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal Popup */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all animate-in fade-in duration-200 my-8">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-lg flex items-center justify-center border border-white/30 shrink-0">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                      {selectedCustomer.levelMember}
                    </span>
                  </h2>
                  <p className="text-xs text-blue-100 font-mono mt-0.5">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCustomer.phone && selectedCustomer.phone !== "-" && (
                  <a
                    href={`https://wa.me/${formatWhatsAppPhone(selectedCustomer.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle size={14} /> Hubungi via WhatsApp
                  </a>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCustomer.email);
                    toast.success("Email disalin ke clipboard!");
                  }}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Mail size={14} /> Salin Email
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  disabled={deletingId === selectedCustomer.id}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  {deletingId === selectedCustomer.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Hapus Pelanggan
                </button>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Total Belanja</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white block mt-0.5">
                    {formatRupiah(selectedCustomer.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Pesanan Sukses</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white block mt-0.5">
                    {selectedCustomer.totalOrders} Transaksi
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Saldo Poin</span>
                  <span className="font-bold text-sm text-amber-500 block mt-0.5">
                    {selectedCustomer.poin.toLocaleString("id-ID")} Poin
                  </span>
                </div>
              </div>

              {/* Alamat Pengiriman Utama */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <MapPin size={14} className="text-blue-500" /> Alamat Utama Pengiriman
                </h3>
                {selectedCustomer.alamatUtama ? (
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.alamatUtama.penerima}{" "}
                      <span className="text-gray-400 font-normal">
                        ({selectedCustomer.alamatUtama.telepon})
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCustomer.alamatUtama.alamatLengkap}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {selectedCustomer.alamatUtama.kota},{" "}
                      {selectedCustomer.alamatUtama.kodePos}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Belum menyimpan alamat pengiriman.
                  </p>
                )}
              </div>

              {/* Profil Ukuran Tubuh (Save My Size) */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Ruler size={14} className="text-purple-500" /> Profil Ukuran Tubuh (Save My Size)
                </h3>
                {selectedCustomer.ukuran ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-purple-600 dark:text-purple-400 block text-[10px] font-semibold">Tinggi Badan</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedCustomer.ukuran.tinggiBadan || "-"} cm
                      </span>
                    </div>
                    <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-purple-600 dark:text-purple-400 block text-[10px] font-semibold">Berat Badan</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedCustomer.ukuran.beratBadan || "-"} kg
                      </span>
                    </div>
                    <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-purple-600 dark:text-purple-400 block text-[10px] font-semibold">Lingkar Dada</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedCustomer.ukuran.lingkarDada || "-"} cm
                      </span>
                    </div>
                    <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-purple-600 dark:text-purple-400 block text-[10px] font-semibold">Lingkar Pinggang</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedCustomer.ukuran.lingkarPinggang || "-"} cm
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Belum mengisi profil ukuran tubuh.
                  </p>
                )}
              </div>

              {/* Riwayat Pesanan Terbaru */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ShoppingBag size={14} className="text-blue-500" /> Riwayat Pesanan Terbaru
                </h3>
                {selectedCustomer.recentOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada riwayat pesanan.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.recentOrders.map((ord) => (
                      <Link
                        key={ord.id}
                        href={`/admin/pesanan/${ord.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-gray-900 dark:text-white">
                            #{ord.id.split("-")[0].toUpperCase()}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />{" "}
                            {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatRupiah(ord.totalHarga)}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-0.5 ${getStatusBadgeClass(
                                ord.statusPesanan
                              )}`}
                            >
                              {ord.statusPesanan}
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
