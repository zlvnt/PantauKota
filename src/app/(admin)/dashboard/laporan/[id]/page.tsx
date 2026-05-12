import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, User, ArrowLeft, Flame, ThumbsUp, MessageCircle } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import StatusBadge from '@/components/ui/Badge';
import KomentarSection from '@/components/komentar/KomentarSection';
import StatusTimeline from '@/components/laporan/StatusTimeline';
import PrioritasScore from '@/components/laporan/PrioritasScore';
import { CLOUDINARY_DETAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AdminStatusUpdater from './AdminStatusUpdater';

const AdminMapView = dynamic(() => import('@/components/map/AdminMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-surface-container-low rounded-xl animate-pulse" />
  ),
});

interface Props {
  params: { id: string };
}

export default async function AdminDetailLaporanPage({ params }: Props) {
  const session = await getCurrentSession();

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

  // Data laporan untuk AdminMapView (dibentuk sesuai tipe LaporanAdminMapItem)
  const laporanMapData = [{
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
  }];

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-surface">
      <div className="max-w-7xl mx-auto pb-8 lg:pb-20 pt-6 px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8 space-y-4">

          {/* Back Button — dengan label teks */}
          <Link
            href="/kelola-laporan"
            className="inline-flex items-center gap-2 p-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-ambient text-sm font-medium text-on-surface/70"
            title="Kembali ke Kelola Laporan"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>

          {/* Card Header: Judul, Badges, & Meta Info */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-5">
            {/* Badges: Status, Kategori, Prioritas, Skor */}
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

            {/* Judul */}
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface leading-tight">
              {laporan.judul}
            </h1>

            {/* Meta: Pelapor, Tanggal, Vote, Komentar */}
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

        {/* ── MAIN GRID ─────────────────────────────────────────────────
            Desktop: [Foto+Deskripsi+Komentar (7)] | [Peta+Status sticky (5)]
            Mobile:  Foto → Deskripsi → Komentar → Peta → Status+Aksi
        ───────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── KOLOM KIRI: Foto + Deskripsi + Komentar ── */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Card: Foto */}
            <div className="relative bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden h-72 sm:h-80 lg:h-[340px]">
              {laporan.foto && laporan.foto.length > 0 ? (
                laporan.foto.length === 1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getCloudinaryImageUrl(laporan.foto[0], CLOUDINARY_DETAIL_IMAGE_OPTIONS)}
                    alt={`Foto ${laporan.judul}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Carousel jika banyak foto */
                  <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {laporan.foto.map((url, i) => (
                      <div key={i} className="relative shrink-0 w-full h-full snap-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getCloudinaryImageUrl(url, CLOUDINARY_DETAIL_IMAGE_OPTIONS)}
                          alt={`Foto ${laporan.judul} ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {laporan.foto.length} foto
                    </span>
                  </div>
                )
              ) : (
                /* Placeholder jika tidak ada foto */
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-container-low">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                    <DynamicIcon iconName={laporan.kategori.icon} className="w-6 h-6 text-on-surface/30" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-on-surface/40 font-medium">Tidak ada foto laporan</p>
                </div>
              )}
            </div>

            {/* Card: Deskripsi */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 flex flex-col min-h-[200px]">
              <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold pb-3 mb-4 border-b border-outline-variant/15">
                Detail Laporan
              </h3>
              <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap flex-1">
                {laporan.deskripsi}
              </p>
            </div>

            {/* Card: Komentar */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8">
              <KomentarSection laporanId={laporan.id} />
            </div>

          </div>

          {/* ── KOLOM KANAN: Lokasi & Peta + Status & Aksi (sticky, row-span-2) ──────── */}
          <div className="lg:col-span-5 lg:row-span-2 order-3 lg:order-2">
            <div className="lg:sticky lg:top-8 space-y-6">

              {/* Card: Lokasi & Peta */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold pb-3 border-b border-outline-variant/15">
                  Lokasi Kejadian
                </h3>
                {laporan.alamat && (
                  <div className="flex items-start gap-2 text-sm text-on-surface/90 bg-surface-container-low p-4 rounded-xl font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="leading-relaxed">{laporan.alamat}</span>
                  </div>
                )}
                <div className="h-52 w-full rounded-xl overflow-hidden">
                  <AdminMapView laporan={laporanMapData} />
                </div>
                <p className="text-[10px] font-mono tracking-wider text-on-surface/60 text-right">
                  {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
                </p>
              </div>

              {/* Card: Status Timeline + Ubah Status */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-4 min-h-[500px] flex flex-col">
                <h3 className="text-[11px] uppercase tracking-widest text-on-surface/60 font-bold pb-3 border-b border-outline-variant/15">
                  Status Laporan
                </h3>
                <div className="flex-1">
                  <StatusTimeline
                    status={laporan.status}
                    createdAt={laporan.createdAt.toISOString()}
                    selesaiAt={laporan.selesaiAt ? laporan.selesaiAt.toISOString() : null}
                    catatanAdmin={laporan.catatanAdmin}
                    fotoPenyelesaian={laporan.fotoPenyelesaian}
                  />
                </div>
                {/* Komponen client untuk ubah status */}
                <AdminStatusUpdater
                  laporanId={laporan.id}
                  initialStatus={laporan.status}
                  judul={laporan.judul}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

