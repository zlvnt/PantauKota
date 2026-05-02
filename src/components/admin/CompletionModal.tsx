'use client';

import { useState, useRef } from 'react';
import { X, Upload, Camera, Loader, CheckCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { catatanAdmin: string; fotoPenyelesaian: string | null }) => Promise<void>;
  laporanJudul: string;
}

export default function CompletionModal({
  isOpen,
  onClose,
  onSubmit,
  laporanJudul,
}: CompletionModalProps) {
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toasts, removeToast, success, error: showError } = useToast();

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB as per DESIGN.md standard)
    if (file.size > 5 * 1024 * 1024) {
      showError('Ukuran file maksimal 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload gagal');

      const data = await res.json();
      setFoto(data.url);
      success('Foto berhasil diunggah');
    } catch (err) {
      showError('Gagal mengunggah foto');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation - hanya catatan admin yang wajib
    if (!catatanAdmin.trim()) {
      showError('Catatan admin wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        catatanAdmin: catatanAdmin.trim(),
        fotoPenyelesaian: foto, // bisa null (opsional)
      });

      // Reset form
      setCatatanAdmin('');
      setFoto(null);
      success('Laporan berhasil diselesaikan');
      onClose();
    } catch (err) {
      console.error('Error submitting completion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data penyelesaian';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    setCatatanAdmin('');
    setFoto(null);
    onClose();
  };

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

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgba(42,52,57,0.12)] w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-on-surface">
                Selesaikan Laporan
              </h2>
              <p className="text-sm text-on-surface/60 mt-1 truncate">
                {laporanJudul}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="shrink-0 p-2 rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Catatan Admin */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface/60">
                Catatan Admin *
              </label>
              <textarea
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                placeholder="Jelaskan tindakan yang telah dilakukan untuk menyelesaikan laporan ini..."
                rows={4}
                disabled={isSubmitting || isUploading}
                className="w-full px-4 py-3.5 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface placeholder:text-on-surface/40 resize-none disabled:opacity-50"
              />
            </div>

            {/* Foto Bukti Penyelesaian */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface/60">
                Foto Bukti Penyelesaian (Opsional)
              </label>

              {foto ? (
                <div className="relative rounded-xl overflow-hidden bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto}
                    alt="Bukti penyelesaian"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setFoto(null)}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-white" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading || isSubmitting}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {/* File Manager Upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isSubmitting}
                      className="flex flex-col items-center justify-center gap-2 p-6 bg-surface-container-low hover:bg-surface-container-high rounded-xl border border-outline-variant/15 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Spinner size="sm" />
                      ) : (
                        <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      )}
                      <span className="text-xs font-medium text-on-surface">
                        {isUploading ? 'Mengunggah...' : 'Pilih File'}
                      </span>
                    </button>

                    {/* Camera Capture */}
                    <button
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment');
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={isUploading || isSubmitting}
                      className="flex flex-col items-center justify-center gap-2 p-6 bg-surface-container-low hover:bg-surface-container-high rounded-xl border border-outline-variant/15 transition-colors disabled:opacity-50"
                    >
                      <Camera className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-on-surface">
                        Ambil Foto
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-on-surface/60 text-center">
                    Maksimal 5MB • Format: JPG, PNG, WebP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant/15">
            <button
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 bg-surface-container-highest hover:bg-surface-container-high rounded-xl text-sm font-semibold text-on-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !catatanAdmin.trim()}
              className="px-6 py-3 bg-primary hover:bg-primary-dim text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  Selesaikan Laporan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
