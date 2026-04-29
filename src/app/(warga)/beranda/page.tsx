import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const session = await getServerSession(authOptions);

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
      voteCount: true,
      createdAt: true,
      foto: true,
      kategori: {
        select: { id: true, nama: true, icon: true, warna: true },
      },
      _count: {
        select: { komentar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialisasi Date → string agar aman dikirim ke Client Component
  const laporan: LaporanSaya[] = rawLaporan.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      laporan={laporan}
      userName={session.user.name ?? 'Warga'}
    />
  );
}
