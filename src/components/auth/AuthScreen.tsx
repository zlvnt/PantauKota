"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface AuthScreenProps {
  defaultIsLogin?: boolean;
  initialError?: string;
  initialNotice?: string;
}

export default function AuthScreen({ defaultIsLogin = true, initialError = '', initialNotice = '' }: AuthScreenProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState(initialNotice);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (notice) setNotice('');
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setNotice('');

    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email.toLowerCase(),
      password: formData.password,
    });

    if (loginError) {
      const message = loginError.message.toLowerCase();
      setError(
        message.includes('email not confirmed')
          ? 'Email belum dikonfirmasi. Buka inbox email Anda lalu klik link konfirmasi dari Supabase.'
          : 'Email atau kata sandi tidak valid. Periksa kembali.'
      );
      setIsLoading(false);
      return;
    }

    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    setIsLoading(false);

    if (!session?.user) {
      setError('Akun berhasil masuk di Supabase Auth, tetapi profil aplikasi belum siap. Coba muat ulang halaman lalu masuk lagi.');
      await supabase.auth.signOut();
      return;
    }

    if (session?.user?.role === 'ADMIN') {
      router.push('/dashboard');
    } else {
      router.push('/beranda');
    }
  };

  // ─── Submit: Register via API ─────────────────────────────────────────────
  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    setNotice('');

    // Validasi dasar di client
    if (formData.name.trim().length < 2) {
      setError('Nama minimal 2 karakter.');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      setIsLoading(false);
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Terjadi kendala pada sistem');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    if (data.needsEmailConfirmation) {
      setIsLogin(true);
      setFormData({ email: formData.email.toLowerCase(), password: '', name: '' });
      setNotice('Pendaftaran berhasil. Kami mengirim link konfirmasi ke email Anda. Buka email tersebut, klik konfirmasi, lalu masuk kembali.');
      return;
    }

    router.push('/beranda');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '' });
    setShowPassword(false);
    setError('');
    setNotice('');
  };

  return (
    <div className="w-full min-h-screen flex bg-surface font-sans text-on-surface">
      {/* Kiri - Hero / Slogan */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop"
            alt="Pemandangan Kota"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#426464]/85 mix-blend-multiply" />
        </div>

        <div className="relative z-10 text-white max-w-xl p-12 bg-[#2a3439]/90 rounded-2xl shadow-ambient">
          <h1 className="text-5xl font-display font-semibold mb-6 leading-[1.1] text-surface-container-lowest">
            PantauKota. Lapor Cepat, Tindak Tepat.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-sans font-light">
            Mari wujudkan lingkungan perkotaan yang lebih tertata dan transparan. Suara dari Anda adalah awal dari infrastruktur yang lebih baik.
          </p>
        </div>
      </div>

      {/* Kanan - Form */}
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
                : 'Bergabunglah untuk mulai membagikan bukti dan melaporkan masalah infrastruktur di kota Anda.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 mb-6 p-3.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2.5 mb-6 p-3.5 bg-[#006d4a]/10 rounded-lg text-sm text-[#006d4a]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span>{notice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-[0.375rem] focus:border-primary focus:bg-surface-container-lowest outline-none transition-all placeholder:text-[#a9b4b9] text-on-surface text-sm"
                  placeholder="Budi Santoso"
                  required={!isLogin}
                  disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8a969c] hover:text-on-surface transition-colors focus:outline-none"
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-primary bg-surface-container-low border-transparent rounded focus:ring-primary" />
                  <span className="ml-3 text-sm text-[#677177] group-hover:text-on-surface transition-colors">Tetap masuk</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-primary hover:bg-primary-dim disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-[0.375rem] transition-colors flex items-center justify-center gap-2 shadow-ambient"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Memverifikasi...' : 'Membuat akun...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Masuk' : 'Daftar Sekarang'}
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>

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
