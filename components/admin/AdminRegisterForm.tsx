"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

export default function AdminRegisterForm() {
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

    toast.success("Akun admin berhasil dibuat!");
    // Jalankan skrip promosi otomatis menjadi ADMIN lalu lemparkan kembali ke /admin
    window.location.href = "/api/upgrade";
  };

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-center mb-6">
        <Image src="/images/irwa-logo.png" alt="IRWA Logo" width={400} height={180} className="w-auto h-32 md:h-40 object-contain max-w-full px-4" priority />
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Buat Akun Admin</h2>
        <p className="text-sm text-gray-500 mt-1">Daftarkan email administrator baru</p>
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
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              placeholder="Nama Admin"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
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
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
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

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Sudah punya akses?{' '}
          <Link href="/admin" className="font-semibold text-blue-600 hover:text-blue-700">
            Masuk ke Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
