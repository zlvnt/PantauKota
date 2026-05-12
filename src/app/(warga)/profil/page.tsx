'use client';

import { useSession } from '@/hooks/useAuthSession';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'WARGA' | 'ADMIN';
}

export default function WargaProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchUserProfile();
    }
  }, [status, session, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData(prev => ({ ...prev, name: data.name }));
      } else {
        showError('Gagal memuat data profil');
      }
    } catch {
      showError('Terjadi kesalahan saat memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showError('Password baru tidak cocok');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      showError('Masukkan password saat ini untuk mengubah password');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      showError('Password baru minimal 6 karakter');
      return;
    }

    setUpdating(true);

    try {
      const payload: {
        name: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: formData.name.trim(),
      };

      // Hanya kirim password jika ada perubahan
      if (formData.newPassword && formData.currentPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user data
        await fetchUserProfile();
        
        await update();

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        // Show success toast
        if (formData.newPassword) {
          success('Password berhasil diubah');
        } else {
          success('Profil berhasil diperbarui');
        }

        // Redirect ke beranda setelah 1 detik
        setTimeout(() => {
          router.push('/beranda');
        }, 1000);
      } else {
        showError(data.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showError('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setUpdating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="w-full min-h-screen bg-surface pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8 overflow-x-hidden">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/beranda')}
              className="p-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-[0_2px_8px_rgba(42,52,57,0.08)] shrink-0"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface" strokeWidth={2} />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface tracking-tight truncate">
                Manajemen Profil
              </h1>
              <p className="text-xs sm:text-sm text-[#677177] mt-1 truncate">
                Kelola informasi akun dan keamanan Anda
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_8px_30px_rgba(42,52,57,0.08)] w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-display font-semibold text-on-surface">
                Informasi Akun
              </h2>
              <div className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full w-fit">
                Warga
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full">
              {/* Email (Read-only) */}
              <div className="w-full">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl text-on-surface opacity-75 text-sm sm:text-base"
                />
                <p className="text-xs text-[#677177] mt-2">Email tidak dapat diubah</p>
              </div>

              {/* Name */}
              <div className="w-full">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl text-on-surface focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-sm sm:text-base"
                  required
                />
              </div>

              {/* Divider */}
              <div className="pt-4 sm:pt-6 pb-2 w-full">
                <h3 className="text-base sm:text-lg font-display font-semibold text-on-surface mb-1">
                  Ubah Password
                </h3>
                <p className="text-xs text-[#677177]">
                  Kosongkan jika tidak ingin mengubah password
                </p>
              </div>

              {/* Current Password */}
              <div className="w-full">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Password Saat Ini
                </label>
                <div className="relative w-full">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 bg-surface-container-low border border-transparent rounded-xl text-on-surface focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-sm sm:text-base"
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#677177] hover:text-on-surface transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="w-full">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Password Baru
                </label>
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 bg-surface-container-low border border-transparent rounded-xl text-on-surface focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-sm sm:text-base"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#677177] hover:text-on-surface transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="w-full">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#677177] mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 bg-surface-container-low border border-transparent rounded-xl text-on-surface focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-sm sm:text-base"
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#677177] hover:text-on-surface transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 w-full">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(66,100,100,0.2)]"
                >
                  {updating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
