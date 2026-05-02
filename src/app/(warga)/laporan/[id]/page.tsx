'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import KomentarSection from '@/components/komentar/KomentarSection';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import type { LaporanDetail } from '@/types/laporan';

export default function DetailLaporanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState(0);

  useEffect(() => {
    fetch(`/api/laporan/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setLaporan(data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center pt-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !laporan) {
    return (
      <div className="flex flex-col items-center justify-center pt-40 gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        <p className="text-sm">Laporan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-sm text-primary font-semibold">
          Kembali
        </button>
      </div>
    );
  }

  const tanggal = new Date(laporan.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
      {/* Back + Status */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <StatusBadge status={laporan.status} />
      </div>

      {/* Kategori + Judul */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <DynamicIcon
            iconName={laporan.kategori.icon ?? 'AlertCircle'}
            className="w-3.5 h-3.5 text-muted-foreground"
            strokeWidth={1.5}
          />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            {laporan.kategori.nama}
          </span>
        </div>
        <h1 className="text-2xl font-display font-semibold text-on-surface leading-snug">
          {laporan.judul}
        </h1>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" strokeWidth={1.5} />
          {laporan.user.name}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
          {tanggal}
        </span>
        {laporan.alamat && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
            {laporan.alamat}
          </span>
        )}
      </div>

      {/* Foto */}
      {laporan.foto.length > 0 && (
        <div className="mb-8 space-y-2">
          <div className="rounded-xl overflow-hidden bg-surface-container-low aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={laporan.foto[selectedFoto]}
              alt={laporan.judul}
              className="w-full h-full object-cover"
            />
          </div>
          {laporan.foto.length > 1 && (
            <div className="flex gap-2">
              {laporan.foto.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFoto(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-opacity ${
                    selectedFoto === i ? 'opacity-100 ring-2 ring-primary' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deskripsi */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Deskripsi
        </p>
        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{laporan.deskripsi}</p>
      </div>

      {/* Catatan Admin */}
      {laporan.catatanAdmin && (
        <div className="mb-8 px-4 py-4 rounded-xl bg-surface-container-low">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Tanggapan Admin
          </p>
          <p className="text-sm text-on-surface leading-relaxed">{laporan.catatanAdmin}</p>
          {laporan.fotoPenyelesaian && (
            <div className="mt-3 rounded-lg overflow-hidden aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={laporan.fotoPenyelesaian} alt="Bukti penyelesaian" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Komentar */}
      <div className="pt-2">
        <KomentarSection laporanId={id} />
      </div>
    </div>
  );
}
