import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { STATUS_CONFIG } from '@/types/laporan';
import { Calendar, MapPin, User, ArrowLeft } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import VoteButton from '@/components/ui/VoteButton';
import KomentarSection from '@/components/komentar/KomentarSection';
import StatusTimeline from '@/components/laporan/StatusTimeline';
import DeleteLaporanButton from '@/components/laporan/DeleteLaporanButton';
import { CLOUDINARY_DETAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-surface-container-low rounded-xl animate-pulse" />
  ),
});

interface Props {
  params: { id: string };
}

export default async function DetailLaporanPage({ params }: Props) {
  const session = await getCurrentSession();
  const userId = session?.user?.id;

  // ── Smart Redirect: Admin → Admin Dashboard ──────────────────────────────
  // Jika user adalah admin, redirect ke halaman admin detail
  if (session?.user?.role === 'ADMIN') {
    redirect(`/dashboard/laporan/${params.id}`);
  }

  const laporan = await prisma.laporan.findUnique({
    where: { id: params.id },
    include: {
      kategori: true,
      user: { select: { id: true, name: true } },
      _count: { select: { komentar: true } },
      votes: {
        where: { userId: userId ?? '' },
        select: { id: true },
      },
    },
  });

  if (!laporan) {
    notFound();
  }

  const hasVoted = userId ? (laporan.votes?.length ?? 0) > 0 : false;
  const statusConfig = STATUS_CONFIG[laporan.status as keyof typeof STATUS_CONFIG];
  const isOwner = userId === laporan.user.id;

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto pb-20 pt-24 sm:pt-28 px-4 sm:px-6">

        {/* ── HEADER (Full Width) ─────────────────────────────────────── */}
        <div className="mb-8 space-y-6">
          {/* Back + Hapus */}
          <div className="flex items-center justify-between">
            <Link
              href="/beranda"
              className="inline-flex items-center justify-center p-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-ambient"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </Link>
            <DeleteLaporanButton
              laporanId={laporan.id}
              createdAt={laporan.createdAt.toISOString()}
              status={laporan.status}
              isOwner={isOwner}
            />
          </div>

          {/* Title & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface">
                <DynamicIcon iconName={laporan.kategori.icon} className="w-3.5 h-3.5" />
                {laporan.kategori.nama}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface leading-tight max-w-4xl">
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
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────
            Desktop (lg): 12 kolom, 2 baris
              Baris 1 → [Foto+Deskripsi (7)] | [Peta+Timeline (5, row-span-2)]
              Baris 2 → [Komentar (7)]        | (kolom kanan lanjut)
            Mobile: satu kolom — urutan DOM = Foto→Deskripsi→Peta→Timeline→Komentar
        ─────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* KOLOM KIRI atas: Foto + Deskripsi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Foto */}
            {laporan.foto && laporan.foto.length > 0 && (
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden h-72 sm:h-80">
                {laporan.foto.length === 1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getCloudinaryImageUrl(laporan.foto[0], CLOUDINARY_DETAIL_IMAGE_OPTIONS)}
                    alt={`Foto ${laporan.judul}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
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
              <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold border-b border-outline-variant/15 pb-3 mb-4">
                Detail Laporan
              </h3>
              <p className="text-on-surface/90 leading-[1.6] whitespace-pre-wrap flex-1">
                {laporan.deskripsi}
              </p>
              {/* Upvote */}
              <div className="mt-8 pt-5 border-t border-outline-variant/15 flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">
                  Dukung laporan ini agar cepat ditindaklanjuti.
                </p>
                <VoteButton
                  laporanId={laporan.id}
                  initialVoteCount={laporan.voteCount}
                  initialVoted={hasVoted}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Peta + Timeline — row-span-2 agar mencakup baris komentar */}
          <div className="lg:col-span-5 lg:row-span-2 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Lokasi & Peta */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold border-b border-outline-variant/15 pb-3">
                  Lokasi Kejadian
                </h3>
                {laporan.alamat && (
                  <p className="text-sm text-on-surface/90 flex items-start gap-2 bg-surface-container-low p-3 rounded-xl font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="leading-relaxed">{laporan.alamat}</span>
                  </p>
                )}
                <div className="h-48 w-full rounded-xl overflow-hidden">
                  <MapView
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
                      _count: { komentar: laporan._count.komentar },
                    }]}
                  />
                </div>
                <p className="text-[10px] font-mono tracking-wider text-muted-foreground text-right">
                  {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
                </p>
              </div>

              {/* Status Timeline */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold border-b border-outline-variant/15 pb-3">
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
            <KomentarSection laporanId={laporan.id} />
          </div>

        </div>
      </div>
    </div>
  );
}
