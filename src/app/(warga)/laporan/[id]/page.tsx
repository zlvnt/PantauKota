// 📁 src/app/(warga)/laporan/[id]/page.tsx
// Halaman detail laporan — menggantikan placeholder
// Server Component: fetch data di server, pass ke Client Component

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LaporanDetail from '@/components/laporan/LaporanDetail';
import VoteButton from '@/components/laporan/VoteButton';
import KomentarSection from '@/components/komentar/KomentarSection';
import type { LaporanDetail as LaporanDetailType } from '@/types/laporan';

interface PageProps {
  params: { id: string };
}

// Fetch di server side — lebih cepat, SEO-friendly
async function getLaporan(id: string): Promise<LaporanDetailType | null> {
  try {
    // Gunakan absolute URL untuk server-side fetch
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/laporan/${id}`, {
      // Revalidate setiap 60 detik (ISR)
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Fetch failed');

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const laporan = await getLaporan(params.id);
  if (!laporan) return { title: 'Laporan Tidak Ditemukan | Pantau Kota' };
  return {
    title: `${laporan.judul} | Pantau Kota`,
    description: laporan.deskripsi.slice(0, 150),
  };
}

export default async function LaporanDetailPage({ params }: PageProps) {
  const laporan = await getLaporan(params.id);

  if (!laporan) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        {/* Back button */}
        <Link
          href="/laporan"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Kembali ke Daftar Laporan
        </Link>

        {/* Detail Laporan */}
        <LaporanDetail laporan={laporan} />

        {/* Vote Button (nunggu bagian file vote button makanya merah)*/}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <VoteButton laporanId={laporan.id} initialVoteCount={laporan.voteCount} />
        </div>

        {/* Komentar */}
        <div className="mt-4">
          <KomentarSection laporanId={laporan.id} />
        </div>

      </div>
    </div>
  );
}
