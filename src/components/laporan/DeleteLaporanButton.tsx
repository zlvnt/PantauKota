'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { canDeleteLaporan, getRemainingDeleteTime } from '@/lib/utils';

interface DeleteLaporanButtonProps {
  laporanId: string;
  createdAt: string; // ISO string
  status: string;
  isOwner: boolean;
}

export default function DeleteLaporanButton({
  laporanId,
  createdAt,
  status,
  isOwner,
}: DeleteLaporanButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Gunakan utility function untuk cek kondisi hapus
  const bisaDihapus = canDeleteLaporan(createdAt, status, isOwner);

  if (!bisaDihapus) return null;

  // Hitung sisa waktu menggunakan utility function
  const sisaWaktu = getRemainingDeleteTime(createdAt);

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/laporan/${laporanId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus laporan.');
      router.push('/beranda');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol Hapus */}
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-error bg-error/8 hover:bg-error/15 transition-colors"
        aria-label="Hapus laporan"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        Hapus Laporan
      </button>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" strokeWidth={2} />
                </div>
                <h3 className="font-semibold font-display text-on-surface">Hapus Laporan?</h3>
              </div>
              <button
                onClick={() => { setShowConfirm(false); setError(''); }}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-on-surface/80 leading-relaxed">
                Laporan ini akan <strong className="text-on-surface">dihapus permanen</strong> dan tidak dapat dikembalikan.
                Sisa waktu penghapusan: <span className="font-semibold text-primary">{sisaWaktu}</span>.
              </p>

              {error && (
                <p className="text-xs text-error bg-error/8 px-3 py-2 rounded-lg" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConfirm(false); setError(''); }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-error hover:bg-error/90 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  )}
                  {loading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
