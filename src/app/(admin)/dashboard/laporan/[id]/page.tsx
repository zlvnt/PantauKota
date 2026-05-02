import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, User, ImageIcon, ArrowLeft, Flame, ThumbsUp, MessageCircle } from 'lucide-react';
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

/**
 * Halaman Detail Laporan Admin
 * Route: /dashboard/laporan/[id]
 * 
 * Diakses dari:
 * - Map popup (link "Lihat Halaman Detail")
 * - Kelola Laporan list (click card)
 * 
 * Fitur:
 * - View lengkap laporan dengan data pelapor
 * - Status timeline tracking
 * - Prioritas score
 * - Peta lokasi interaktif
 * - Komentar section
 * - Back button navigation
 */
export default async function AdminDetailLaporanPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  // Guard: Admin only
  if (!session || session.user.role !== 'ADMIN') {
    notFound();
  }

  // Fetch data laporan dengan relasi lengkap
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
      <div className="max-w-4xl mx-auto pb-20 pt-6 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Back Button */}
        <Link
          href="/kelola-laporan"
          className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-[0_2px_8px_rgba(42,52,57,0.08)] shrink-0"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </Link>

        {/* Header & Status */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-6 sm:p-8 space-y-5">
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

          <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-on-surface leading-tight">
            {laporan.judul}
          </h1>

          {/* Pelapor Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-on-surface/60 pt-4 border-t border-outline-variant/15">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-medium text-on-surface">{laporan.user.name}</span>
            </div>
            <div className="flex items-center gap-2">
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

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-on-surface/60 pt-4 border-t border-outline-variant/15">
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

        {/* Foto Laporan */}
        {laporan.foto && laporan.foto.length > 0 && (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-surface-container-low shadow-[0_2px_8px_rgba(42,52,57,0.08)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={laporan.foto[0]}
              alt={`Foto ${laporan.judul}`}
              className="w-full h-full object-cover"
            />
            {laporan.foto.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                +{laporan.foto.length - 1} Foto
              </div>
            )}
          </div>
        )}

        {/* Deskripsi */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-6 sm:p-8">
          <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold mb-4">
            Detail Laporan
          </h3>
          <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap">
            {laporan.deskripsi}
          </p>
        </div>

        {/* Lokasi & Peta */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-6 sm:p-8 space-y-4">
          <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold">
            Lokasi Kejadian
          </h3>
          
          {laporan.alamat && (
            <div className="flex items-start gap-2 text-sm text-on-surface/90 bg-surface-container-low p-4 rounded-xl">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{laporan.alamat}</span>
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

          <p className="text-xs text-on-surface/60 text-right">
            Koordinat: {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
          </p>
        </div>

        {/* Status Tracking Timeline */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-6 sm:p-8 space-y-4">
          <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold">
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

        {/* Komentar Section */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-6 sm:p-8">
          <KomentarSection laporanId={laporan.id} />
        </div>
      </div>
    </div>
  );
}
