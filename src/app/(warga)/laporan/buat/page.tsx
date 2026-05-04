<<<<<<< Updated upstream
export default function Component() {
  return (
    <div>page (src/app/(warga)/laporan/buat/page.tsx)</div>
=======
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Camera, X, Loader2, ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import CameraModal from '@/components/ui/CameraModal';
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

  const [isCameraOpen, setIsCameraOpen] = useState(false);

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



  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - fotoFiles.length);
    if (!files.length) return;
    setFotoFiles((prev) => [...prev, ...files]);
    setFotoPreviews((prev) => [...prev, ...files.map(URL.createObjectURL)]);
    e.target.value = '';
  };

  const handleCameraCapture = (file: File) => {
    if (fotoFiles.length >= 3) return;
    setFotoFiles((prev) => [...prev, file]);
    setFotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
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
    <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full overflow-x-hidden">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest hover:bg-surface-container-low text-on-surface transition-colors shadow-ambient"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Laporan Baru
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface leading-tight">
            Buat Laporan
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* KOLOM KIRI (Info & Foto) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Informasi Laporan */}
          <section className="space-y-5 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-ambient">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold border-b border-outline-variant/15 pb-3">
              Informasi Laporan
            </p>

            {/* Kategori */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-on-surface">Kategori</label>
              {kategoriList.length === 0 ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {kategoriList.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKategoriId(k.id)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                        kategoriId === k.id
                          ? 'bg-primary text-white shadow-md'
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
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-on-surface">Judul</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Jalan berlubang di Sudirman..."
                maxLength={100}
                className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-xl text-sm text-on-surface placeholder:text-muted-foreground outline-none transition-colors"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-on-surface">Deskripsi</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Jelaskan detail masalah yang Anda temukan (lokasi patokan, tingkat bahaya, dll)..."
                maxLength={1000}
                rows={5}
                className="w-full bg-surface-container-low border border-transparent focus:border-primary px-4 py-3 rounded-xl text-sm text-on-surface placeholder:text-muted-foreground outline-none transition-colors resize-none leading-relaxed"
              />
            </div>
          </section>

          {/* Foto */}
          <section className="space-y-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-ambient">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                Bukti Foto
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface">
                {fotoFiles.length}/3
              </span>
            </div>

            <div className="flex gap-3 flex-wrap pt-2">
              {fotoPreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-container-low shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-error text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {fotoFiles.length < 3 && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all shrink-0"
                  >
                    <Camera className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[11px] font-semibold">Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all shrink-0"
                  >
                    <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[11px] font-semibold">Galeri</span>
                  </button>
                </div>
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
        </div>

        {/* KOLOM KANAN (Lokasi & Submit) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="lg:sticky lg:top-20 space-y-8">
            {/* Lokasi */}
            <section className="space-y-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-ambient">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold border-b border-outline-variant/15 pb-3">
                Lokasi Kejadian
              </p>
              
              <div className="pt-2">
                <LocationPicker
                  value={lokasi ? { latitude: lokasi.latitude, longitude: lokasi.longitude } : null}
                  onChange={(coords) => setLokasi(coords)}
                />
              </div>

              {lokasi?.alamat && (
                <div className="mt-4 p-3 bg-surface-container-low rounded-xl">
                  <p className="text-sm text-on-surface leading-relaxed font-medium">
                    {lokasi.alamat}
                  </p>
                </div>
              )}
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dim active:scale-[0.98] text-white py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:active:scale-100 shadow-ambient"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                  {fotoFiles.length > 0 ? 'Mengunggah Foto...' : 'Menyimpan Laporan...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" strokeWidth={2} />
                  Kirim Laporan
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
>>>>>>> Stashed changes
  );
}
