import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, User, ArrowLeft, Flame, ThumbsUp, MessageCircle } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import StatusBadge from '@/components/ui/Badge';
import KomentarSection from '@/components/komentar/KomentarSection';
import StatusTimeline from '@/components/laporan/StatusTimeline';
import PrioritasScore from '@/components/laporan/PrioritasScore';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const AdminMapView = dynamic(() => import('@/components/map/AdminMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-surface-container-low rounded-xl animate-pulse" />
  ),
});

interface Props {
  params: { id: string };
}

export default async function AdminDetailLaporanPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    notFound();
  }

  const laporan = await prisma.laporan.findUnique({
    where: { id: params.id },
    include: {
      kategori: true,
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { komentar: true } },
    },
  });

  if (!laporan) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-surface">
      <div className="max-w-6xl mx-auto pb-20 pt-6 px-4 sm:px-6 lg:px-8">

        {/* ── HEADER (Full Width) ─────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8 space-y-6">
          {/* Back Button */}
          <Link
            href="/kelola-laporan"
            className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-ambient shrink-0"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>

          {/* Header & Status */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={laporan.status} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface">
                <DynamicIcon iconName={laporan.kategori.icon} className="w-3.5 h-3.5" strokeWidth={1.5} />
                {laporan.kategori.nama}
              </span>
              {laporan.prioritas && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-full text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" strokeWidth={2} />
                  PRIORITAS
                </span>
              )}
              <PrioritasScore
                voteCount={laporan.voteCount}
                createdAt={laporan.createdAt.toISOString()}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface leading-tight max-w-4xl">
              {laporan.judul}
            </h1>

            {/* Pelapor Info & Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-on-surface/60 pt-4 border-t border-outline-variant/15">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-medium text-on-surface">{laporan.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {new Date(laporan.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-medium">{laporan.voteCount} suara</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-medium">{laporan._count.komentar} komentar</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────
            Desktop: [Foto+Deskripsi (7)] | [Peta+Timeline (5, row-span-2)]
                     [Komentar (7)]        |
            Mobile:  Foto → Deskripsi → Peta → Timeline → Komentar
        ───────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* KOLOM KIRI atas: Foto + Deskripsi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Foto */}
            {laporan.foto && laporan.foto.length > 0 && (
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden h-72 sm:h-80">
                {laporan.foto.length === 1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={laporan.foto[0]} alt={`Foto ${laporan.judul}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {laporan.foto.map((url, i) => (
                      <div key={i} className="relative shrink-0 w-full h-full snap-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Foto ${laporan.judul} ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {laporan.foto.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {laporan.foto.length} foto
                  </span>
                )}
              </div>
            )}

            {/* Deskripsi */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 min-h-[288px] sm:min-h-[320px] flex flex-col">
              <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold border-b border-outline-variant/15 pb-3 mb-4">
                Detail Laporan
              </h3>
              <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap flex-1">
                {laporan.deskripsi}
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Peta + Timeline — row-span-2 agar mencakup baris komentar */}
          <div className="lg:col-span-5 lg:row-span-2 space-y-6">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Lokasi & Peta */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold border-b border-outline-variant/15 pb-3">
                  Lokasi Kejadian
                </h3>
                {laporan.alamat && (
                  <div className="flex items-start gap-2 text-sm text-on-surface/90 bg-surface-container-low p-4 rounded-xl font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="leading-relaxed">{laporan.alamat}</span>
                  </div>
                )}
                <div className="h-64 w-full rounded-xl overflow-hidden">
                  <AdminMapView
                    laporan={[{
                      id: laporan.id,
                      judul: laporan.judul,
                      latitude: laporan.latitude,
                      longitude: laporan.longitude,
                      alamat: laporan.alamat,
                      status: laporan.status,
                      prioritas: laporan.prioritas,
                      voteCount: laporan.voteCount,
                      createdAt: laporan.createdAt.toISOString(),
                      foto: laporan.foto,
                      kategori: laporan.kategori,
                      user: { id: laporan.user.id, name: laporan.user.name },
                      _count: { komentar: laporan._count.komentar },
                    }]}
                  />
                </div>
                <p className="text-[10px] font-mono tracking-wider text-on-surface/60 text-right">
                  {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
                </p>
              </div>

              {/* Status Timeline */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold border-b border-outline-variant/15 pb-3">
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

          {/* KOMENTAR — grid item terpisah → selalu paling bawah di mobile & desktop */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8">
              <KomentarSection laporanId={laporan.id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
