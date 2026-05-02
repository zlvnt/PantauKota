// 📁 src/components/laporan/LaporanDetail.tsx
// Komponen detail laporan — menggantikan placeholder
// Dipanggil dari src/app/(warga)/laporan/[id]/page.tsx

'use client';

import dynamic from 'next/dynamic';
import { Loader2, MapPin, Calendar, User, Tag, MessageCircle, ThumbsUp } from 'lucide-react';
import ImageGallery from '@/components/laporan/ImageGallery';
import StatusBadge from '@/components/laporan/StatusBadge';
import type { LaporanDetail as LaporanDetailType } from '@/types/laporan';

// Dynamic import peta untuk hindari SSR error (leaflet butuh window)
const DetailMap = dynamic(
  () => import('@/components/map/DetailMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 rounded-xl bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface LaporanDetailProps {
  laporan: LaporanDetailType;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function LaporanDetail({ laporan }: LaporanDetailProps) {
  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">

        {/* Status + Kategori */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={laporan.status} />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <Tag className="w-3 h-3" strokeWidth={1.5} />
            {laporan.kategori.icon && `${laporan.kategori.icon} `}
            {laporan.kategori.nama}
          </span>
        </div>

        {/* Judul */}
        <h1 className="text-xl font-bold text-foreground leading-snug">
          {laporan.judul}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" strokeWidth={1.5} />
            {laporan.user.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            {formatDate(laporan.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
            {laporan.voteCount} suara
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            {laporan._count.komentar} komentar
          </span>
        </div>

        {/* Alamat */}
        {laporan.alamat && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />
            <span>{laporan.alamat}</span>
          </div>
        )}
      </div>

      {/* Foto */}
      {laporan.foto.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Foto Bukti
          </h2>
          <ImageGallery images={laporan.foto} alt={laporan.judul} />
        </div>
      )}

      {/* Deskripsi */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Deskripsi
        </h2>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {laporan.deskripsi}
        </p>
      </div>

      {/* Peta Lokasi */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Lokasi di Peta
        </h2>
        <DetailMap
          latitude={laporan.latitude}
          longitude={laporan.longitude}
          judul={laporan.judul}
          alamat={laporan.alamat}
        />
        <p className="text-xs text-muted-foreground">
          {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
        </p>
      </div>

      {/* Catatan Admin (jika ada) */}
      {laporan.catatanAdmin && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide">
            Tanggapan Petugas
          </h2>
          <p className="text-sm text-green-700 leading-relaxed whitespace-pre-wrap">
            {laporan.catatanAdmin}
          </p>
          {laporan.selesaiAt && (
            <p className="text-xs text-green-600">
              Diselesaikan pada {formatDate(laporan.selesaiAt)}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
