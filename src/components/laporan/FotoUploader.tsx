// 📁 src/components/laporan/FotoUploader.tsx
// Komponen upload multiple foto ke Cloudinary via API route
// Dipanggil dari LaporanForm

'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FotoUploaderProps {
  value: string[];                       // URL foto yang sudah diupload
  onChange: (urls: string[]) => void;    // Callback ke react-hook-form
  maxFiles?: number;
}

export default function FotoUploader({
  value,
  onChange,
  maxFiles = 5,
}: FotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxFiles - value.length;

      if (fileArray.length > remaining) {
        setError(`Maksimal ${maxFiles} foto. Kamu bisa tambah ${remaining} lagi.`);
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        fileArray.forEach((f) => formData.append('files', f));

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? 'Gagal upload foto');
        }

        onChange([...value, ...data.urls]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal upload foto');
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
      e.target.value = ''; // Reset supaya bisa pilih file sama lagi
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const removePhoto = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Drop zone — hanya tampil kalau masih bisa tambah foto */}
      {canAddMore && (
        <label
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
            uploading && 'pointer-events-none opacity-60'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleFileInput}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={1.5} />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {uploading ? 'Mengupload...' : 'Klik atau drag foto ke sini'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WebP · Maks. 5MB per foto · {value.length}/{maxFiles} foto
            </p>
          </div>
        </label>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border"
            >
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Overlay + tombol hapus */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-destructive rounded-full text-white hover:bg-destructive/80"
                  aria-label="Hapus foto"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
              {/* Nomor */}
              <span className="absolute top-1 left-1 text-[10px] bg-black/50 text-white rounded px-1">
                {i + 1}
              </span>
            </div>
          ))}

          {/* Placeholder kosong */}
          {canAddMore && value.length < maxFiles && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handleFileInput}
                disabled={uploading}
              />
              <ImageIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
