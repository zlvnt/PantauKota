'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Camera, X, Loader2, ArrowLeft, Send } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import type { KategoriItem } from '@/types/laporan';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-80 rounded-lg bg-surface-container-low animate-pulse" />,
});

interface Lokasi {
  latitude: number;
  longitude: number;
  alamat?: string;
}

export default function BuatLaporanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error: toastError } = useToast();

  useEffect(() => {
    fetch('/api/kategori').then((r) => r.json()).then(setKategoriList);
  }, []);

  useEffect(() => {
    return () => fotoPreviews.forEach(URL.revokeObjectURL);
  }, [fotoPreviews]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - fotoFiles.length);
    if (!files.length) return;
    setFotoFiles((prev) => [...prev, ...files]);
    setFotoPreviews((prev) => [...prev, ...files.map(URL.createObjectURL)]);
    e.target.value = '';
  };

  const removeFoto = (i: number) => {
    URL.revokeObjectURL(fotoPreviews[i]);
    setFotoFiles((prev) => prev.filter((_, idx) => idx !== i));
    setFotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokasi) return toastError('Pilih lokasi pada peta terlebih dahulu.');
    if (!kategoriId) return toastError('Pilih kategori laporan.');
    if (!judul.trim()) return toastError('Judul laporan tidak boleh kosong.');
    if (!deskripsi.trim()) return toastError('Deskripsi laporan tidak boleh kosong.');

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of fotoFiles) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Gagal mengunggah foto.');
        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: judul.trim(),
          deskripsi: deskripsi.trim(),
          kategoriId,
          foto: uploadedUrls,
          latitude: lokasi.latitude,
          longitude: lokasi.longitude,
          alamat: lokasi.alamat,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Gagal membuat laporan.');
      }

      const data = await res.json();
      success('Laporan berhasil dikirim!');
      router.push(`/laporan/${data.id}`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Laporan Baru
          </p>
          <h1 className="text-xl font-display font-semibold text-on-surface leading-tight">
            Buat Laporan
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informasi Laporan */}
        <section className="space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Informasi Laporan
          </p>

          {/* Kategori */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Kategori</label>
            {kategoriList.length === 0 ? (
              <div className="flex justify-center py-4"><Spinner size="sm" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {kategoriList.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKategoriId(k.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      kategoriId === k.id
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <DynamicIcon iconName={k.icon ?? 'AlertCircle'} className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className="truncate text-xs">{k.nama}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Judul */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Judul</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Deskripsikan masalah secara singkat..."
              maxLength={100}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-2.5 rounded-lg text-sm text-on-surface placeholder:text-muted-foreground outline-none transition-colors"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail masalah yang Anda temukan..."
              maxLength={1000}
              rows={4}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-2.5 rounded-lg text-sm text-on-surface placeholder:text-muted-foreground outline-none transition-colors resize-none"
            />
          </div>
        </section>

        {/* Lokasi */}
        <section className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Lokasi
          </p>
          <LocationPicker
            value={lokasi ? { latitude: lokasi.latitude, longitude: lokasi.longitude } : null}
            onChange={(coords) => setLokasi(coords)}
          />
          {lokasi?.alamat && (
            <p className="text-xs text-muted-foreground leading-relaxed">{lokasi.alamat}</p>
          )}
        </section>

        {/* Foto */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Foto
            </p>
            <span className="text-xs text-muted-foreground">{fotoFiles.length}/3</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            {fotoPreviews.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-container-low shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-on-surface/70 text-surface rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {fotoFiles.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors shrink-0"
              >
                <Camera className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium">Tambah</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFotoChange}
            className="hidden"
          />
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dim text-white py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 shadow-ambient"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              {fotoFiles.length > 0 ? 'Mengunggah foto...' : 'Menyimpan...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" strokeWidth={1.5} />
              Kirim Laporan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
