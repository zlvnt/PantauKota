import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { STATUS_CONFIG } from '@/types/laporan';
import dynamic from 'next/dynamic';
import { Calendar, MapPin, User, ImageIcon } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import VoteButton from '@/components/ui/VoteButton';
import KomentarSection from '@/components/komentar/KomentarSection';
import StatusTimeline from '@/components/laporan/StatusTimeline';

const StaticMap = dynamic(() => import('@/components/map/StaticMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-surface-container-low rounded-[0.375rem] animate-pulse" />
  ),
});

interface Props {
  params: { id: string };
}

export default async function DetailLaporanPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch data — always include votes with fixed where clause to avoid Prisma conditional spread type issues
  const laporan = await prisma.laporan.findUnique({
    where: { id: params.id },
    include: {
      kategori: true,
      user: { select: { id: true, name: true } },
      _count: { select: { komentar: true } },
      votes: {
        where: { userId: userId ?? '' }, // empty string = no match when unauthenticated
        select: { id: true },
      },
    },
  });

  if (!laporan) {
    notFound();
  }

  const _hasVoted = userId ? (laporan.votes?.length ?? 0) > 0 : false;
  const statusConfig = STATUS_CONFIG[laporan.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-6 space-y-8">
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
        </div>
      </div>

      {/* 2. Foto Laporan */}
      {laporan.foto && laporan.foto.length > 0 && (
        <div className="relative w-full aspect-video rounded-[0.375rem] overflow-hidden bg-surface-container-low">
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
      <div className="bg-surface-container-lowest rounded-[0.375rem] p-6 shadow-ambient">
        <h3 className="text-label-sm uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Detail Laporan
        </h3>
        <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap">
          {laporan.deskripsi}
        </p>

        {/* Action Bar (Upvote) */}
        <div className="mt-6 pt-6 border-t border-surface-container-low flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Dukung laporan ini agar cepat ditindaklanjuti.
          </p>
          <VoteButton
            laporanId={laporan.id}
            initialVoteCount={laporan.voteCount}
            initialVoted={_hasVoted}
            size="md"
          />
        </div>
      </div>

      {/* 4. Lokasi & Peta Statis */}
      <div className="space-y-3">
        <h3 className="text-label-sm uppercase tracking-widest text-muted-foreground font-semibold">
          Lokasi Kejadian
        </h3>
        {laporan.alamat && (
          <p className="text-sm text-on-surface/90 flex items-start gap-2 bg-surface-container-low p-3 rounded-[0.375rem]">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{laporan.alamat}</span>
          </p>
        )}
        <StaticMap
          latitude={laporan.latitude}
          longitude={laporan.longitude}
          status={laporan.status}
          warnaKategori={laporan.kategori.warna}
        />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground text-right">
          {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
        </p>
      </div>

      {/* 5. Status Tracking Timeline (PBI-11) */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient space-y-4">
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

      {/* 6. Komentar Section */}
      <div className="pt-6 border-t border-outline-variant/20">
        <KomentarSection laporanId={laporan.id} />
      </div>
    </div>
  );
}
