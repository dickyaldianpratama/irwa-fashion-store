"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mendaftar via Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // Berhasil mendaftar, otomatis arahkan ke jalur upgrade untuk menjadi ADMIN
    toast.success("Akun admin berhasil dibuat!");
    
    // Magic: Redirect ke /api/upgrade yang akan otomatis memberi role ADMIN dan mengarahkan ke /admin
    window.location.href = "/api/upgrade";
  };

  return (
    <>
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Buat Akun Admin</h2>
        <p className="text-sm text-gray-500 mt-1">Daftarkan email Anda sebagai administrator</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              placeholder="Nama Admin"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              placeholder="admin@irwafashion.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              placeholder="Minimal 6 karakter"
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Daftar Sebagai Admin <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Sudah punya akun admin?{' '}
        <Link href="/admin-login" className="font-semibold text-blue-600 hover:text-blue-700">
          Masuk Sekarang
        </Link>
      </p>
    </>
  );
}
