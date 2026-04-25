"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthScreen({ defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Email atau kata sandi salah.');
        } else {
          const session = await getSession();
          router.push(session?.user?.role === 'ADMIN' ? '/dashboard' : '/');
          router.refresh();
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Terjadi kendala pada sistem.');
        } else {
          // Auto login setelah register
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError('Pendaftaran berhasil. Silakan masuk.');
            setIsLogin(true);
          } else {
            const session = await getSession();
            router.push(session?.user?.role === 'ADMIN' ? '/dashboard' : '/');
            router.refresh();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '' });
    setShowPassword(false);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen flex bg-surface font-sans text-on-surface">
      {/* Kiri - Bagian Hero / Slogan / Civic Clarity Aesthetic */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-surface-container-low">
        {/* Unsplash Background Image - Gambar Kota Klasik */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop" 
            alt="Pemandangan Kota"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay Tonal "Muted Teal" (#426464) sesuai panduan desain */}
          <div className="absolute inset-0 bg-[#426464]/85 mix-blend-multiply" />
        </div>

        {/* Area Konten Glassmorphism */}
        <div className="relative z-10 text-white max-w-xl p-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-ambient">
          <h1 className="text-5xl font-display font-semibold mb-6 leading-[1.1] text-surface-container-lowest">
             PantauKota. Lapor Cepat, Tindak Tepat.
          </h1>
          
          <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
            Mari wujudkan lingkungan perkotaan yang lebih tertata dan transparan. Suara dari Anda adalah awal dari infrastruktur yang lebih baik.
          </p>
        </div>
      </div>

      {/* Kanan - Form Login/Signup menggunakan prinsip "No Line" dan Tonal Layering */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-display font-semibold text-on-surface mb-3 tracking-tight">
              {isLogin ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isLogin 
                ? 'Masuk ke Papan Kendali untuk terus memantau status laporan di sekitar Anda.' 
                : 'Bergabunglah untuk mulai membagikan bukti dan melaporkan masalah infrastruktur di kota Anda.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Nama Lengkap
                </label>
                {/* Input dengan Tonal Layering: bg-surface-container-low, tanpa border tebal */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-[0.375rem] focus:border-primary focus:bg-surface-container-lowest outline-none transition-all placeholder:text-[#a9b4b9] text-on-surface text-sm"
                  placeholder="Budi Santoso"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-[0.375rem] focus:border-primary focus:bg-surface-container-lowest outline-none transition-all placeholder:text-[#a9b4b9] text-on-surface text-sm"
                placeholder="nama@contoh.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                {isLogin ? 'Kata Sandi' : 'Buat Kata Sandi'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 pr-12 bg-surface-container-low border border-transparent rounded-[0.375rem] focus:border-primary focus:bg-surface-container-lowest outline-none transition-all placeholder:text-[#a9b4b9] text-on-surface text-sm"
                  placeholder={isLogin ? "Masukkan kata sandi Anda" : "Minimal 8 karakter"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8a969c] hover:text-on-surface transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-primary bg-surface-container-low border-transparent rounded focus:ring-primary focus:ring-offset-surface" />
                  <span className="ml-3 text-sm text-[#677177] group-hover:text-on-surface transition-colors">Tetap masuk</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-primary-dim font-medium transition-colors">
                  Lupa sandi?
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-error bg-error/10 px-4 py-2.5 rounded-[0.375rem]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary-dim text-white font-semibold py-3.5 px-4 rounded-[0.375rem] transition-colors flex items-center justify-center gap-2 shadow-ambient disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              ) : (
                <>
                  {isLogin ? 'Masuk' : 'Daftar Sekarang'}
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>

            {/* Pemisah Berbasis Whitespace (No Line) */}
            <div className="pt-8 text-center text-sm">
              <span className="text-[#677177]">
                {isLogin ? "Belum punya akun?" : "Sudah memiliki akun?"}
              </span>{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:text-primary-dim font-semibold transition-colors"
              >
                {isLogin ? 'Mendaftar' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
