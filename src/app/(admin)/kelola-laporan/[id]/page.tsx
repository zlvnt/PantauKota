import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { STATUS_CONFIG } from '@/types/laporan';
import dynamic from 'next/dynamic';
import { Calendar, MapPin, User, ImageIcon, ArrowLeft, ThumbsUp } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import KomentarSection from '@/components/komentar/KomentarSection';
import StatusTimeline from '@/components/laporan/StatusTimeline';
import Link from 'next/link';

const StaticMap = dynamic(() => import('@/components/map/StaticMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-surface-container-low rounded-[0.375rem] animate-pulse" />
  ),
});

interface Props {
  params: { id: string };
}

export default async function AdminDetailLaporanPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  // Ensure only admins can access this page (though middleware should handle it)
  if (session?.user?.role !== 'ADMIN') {
    notFound();
  }

  // Fetch data
  const laporan = await prisma.laporan.findUnique({
    where: { id: params.id },
    include: {
      kategori: true,
      user: { select: { id: true, name: true } },
      _count: { select: { komentar: true } },
    },
  });

  if (!laporan) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[laporan.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-6 space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div>
        <Link 
          href="/dashboard/peta" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Peta
        </Link>
      </div>

      {/* 1. Header & Status */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface">
            <DynamicIcon iconName={laporan.kategori.icon} className="w-3.5 h-3.5" />
            {laporan.kategori.nama}
          </span>
          
          {(laporan as any).prioritas && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              🔥 Prioritas Darurat
            </span>
          )}
        </div>

        <h1 className="text-display-md font-bold font-manrope text-on-surface leading-tight">
          {laporan.judul}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium text-on-surface">{laporan.user.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span>
              {new Date(laporan.createdAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="font-medium text-on-surface">{laporan.voteCount} Dukungan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Foto Laporan */}
          {laporan.foto && laporan.foto.length > 0 && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-container-low border border-[rgba(169,180,185,0.15)] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={laporan.foto[0]}
                alt={`Foto ${laporan.judul}`}
                className="w-full h-full object-cover"
              />
              {laporan.foto.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  +{laporan.foto.length - 1} Foto
                </div>
              )}
            </div>
          )}

          {/* 3. Deskripsi */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-[rgba(169,180,185,0.15)]">
            <h3 className="text-label-sm uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Detail Laporan
            </h3>
            <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap">
              {laporan.deskripsi}
            </p>
          </div>

          {/* 6. Komentar Section */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-[rgba(169,180,185,0.15)]">
            <KomentarSection laporanId={laporan.id} />
          </div>
        </div>

        <div className="space-y-6">
          {/* 4. Lokasi & Peta Statis */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient border border-[rgba(169,180,185,0.15)] space-y-3">
            <h3 className="text-label-sm uppercase tracking-widest text-muted-foreground font-semibold">
              Lokasi Kejadian
            </h3>
            {laporan.alamat && (
              <p className="text-sm text-on-surface/90 flex items-start gap-2 bg-surface-container-low p-3 rounded-lg">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="leading-snug">{laporan.alamat}</span>
              </p>
            )}
            <div className="rounded-lg overflow-hidden border border-outline-variant/30">
              <StaticMap
                latitude={laporan.latitude}
                longitude={laporan.longitude}
                status={laporan.status}
                warnaKategori={laporan.kategori.warna}
              />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground text-right mt-1">
              {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
            </p>
          </div>

          {/* 5. Status Tracking Timeline (PBI-11) */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient border border-[rgba(169,180,185,0.15)] space-y-4">
            <h3 className="text-label-sm uppercase tracking-widest text-muted-foreground font-semibold">
              Status Laporan
            </h3>
            <StatusTimeline
              status={laporan.status}
              createdAt={laporan.createdAt.toISOString()}
              selesaiAt={laporan.selesaiAt ? laporan.selesaiAt.toISOString() : null}
              catatanAdmin={laporan.catatanAdmin}
              fotoPenyelesaian={laporan.fotoPenyelesaian}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
