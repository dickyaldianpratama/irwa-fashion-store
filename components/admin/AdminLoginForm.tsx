"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email atau password salah!" : error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Otorisasi Admin Berhasil!");
      router.refresh(); // Refresh halaman agar layout berubah menjadi Dashboard
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-center mb-6">
        <Image src="/images/irwa-logo.png" alt="IRWA Logo" width={100} height={100} className="w-auto h-16 object-contain" />
      </div>
      
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Portal Admin</h2>
        <p className="text-sm text-gray-500 mt-1">Masuk untuk mengelola toko</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              placeholder="admin@irwafashion.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              placeholder="••••••••"
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
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Masuk Sekarang <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Belum punya akses?{' '}
          <Link href="/admin/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Daftar Admin Baru
          </Link>
        </p>
      </div>
    </div>
  );
}
