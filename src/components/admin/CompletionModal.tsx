'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Loader, CheckCircle } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { uploadCompressedImage } from '@/lib/client-image';

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
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toasts, removeToast, success, error: showError } = useToast();

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);



  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyWidth = document.body.style.width;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Block all pointer events on body children except modal
      const style = document.createElement('style');
      style.id = 'modal-pointer-block';
      style.innerHTML = `
        body > *:not(#modal-root) {
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.width = originalBodyWidth;
        
        const styleEl = document.getElementById('modal-pointer-block');
        if (styleEl) styleEl.remove();
      };
    }
  }, [isOpen]);

  const clearSelectedFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setCatatanAdmin('');
    clearSelectedFoto();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Ukuran file maksimal 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar');
      return;
    }

    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!catatanAdmin.trim()) {
      showError('Catatan admin wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      let fotoPenyelesaian: string | null = null;
      if (fotoFile) {
        setIsUploading(true);
        fotoPenyelesaian = await uploadCompressedImage(fotoFile);
        setIsUploading(false);
      }

      await onSubmit({
        catatanAdmin: catatanAdmin.trim(),
        fotoPenyelesaian,
      });

      resetForm();
      success('Laporan berhasil diselesaikan');
      onClose();
    } catch (err) {
      console.error('Error submitting completion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data penyelesaian';
      showError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    resetForm();
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div
        id="modal-root"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/60"
        style={{ zIndex: 999999, pointerEvents: 'auto' }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting && !isUploading) {
            handleClose();
          }
        }}
      >
        <div
          className="bg-surface-container-lowest rounded-2xl shadow-ambient w-full max-w-md overflow-hidden"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 bg-surface-container-low">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-on-surface">
                Selesaikan Laporan
              </h2>
              <p className="text-xs text-on-surface/60 mt-1 truncate">
                {laporanJudul}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="shrink-0 p-1.5 rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 space-y-4">
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

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface/60">
                Foto Bukti Penyelesaian (Opsional)
              </label>

              {fotoPreview ? (
                <div className="relative rounded-xl overflow-hidden bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPreview}
                    alt="Bukti penyelesaian"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={clearSelectedFoto}
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

                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isSubmitting}
                      className="w-full flex flex-col items-center justify-center gap-2 p-6 bg-surface-container-low hover:bg-surface-container-high rounded-xl border border-outline-variant/15 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-on-surface">
                        Pilih File
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

          <div className="flex items-center justify-end gap-3 p-5 bg-surface-container-low">
            <button
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-container-high rounded-xl text-sm font-semibold text-on-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !catatanAdmin.trim()}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dim text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Mengunggah...
                </>
              ) : isSubmitting ? (
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

  return createPortal(modalContent, document.body);
}
