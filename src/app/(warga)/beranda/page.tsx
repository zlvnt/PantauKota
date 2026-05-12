import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import type { LaporanSaya } from '@/types/laporan';

export const metadata = {
  title: 'Dashboard Saya — PantauKota',
  description: 'Pantau status semua laporan yang telah Anda ajukan.',
};

// Server Component — fetch data langsung dari DB, bukan via API route.
// Lebih efisien karena tidak ada round-trip HTTP.
export default async function RiwayatPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const rawLaporan = await prisma.laporan.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      judul: true,
      alamat: true,
      status: true,
      prioritas: true,
      voteCount: true,
      createdAt: true,
      foto: true,
      catatanAdmin: true,
      fotoPenyelesaian: true,
      selesaiAt: true,
      kategori: {
        select: { id: true, nama: true, icon: true, warna: true },
      },
      _count: {
        select: { komentar: true },
      },
      votes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialisasi Date → string agar aman dikirim ke Client Component
  const laporan: LaporanSaya[] = rawLaporan.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    selesaiAt: l.selesaiAt ? l.selesaiAt.toISOString() : null,
    _hasVoted: (l.votes?.length ?? 0) > 0,
    votes: undefined, // Remove votes from final object
  })) as LaporanSaya[];

  return (
    <DashboardClient
      laporan={laporan}
      userName={session.user.name ?? 'Warga'}
    />
  );
}
