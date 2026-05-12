import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/laporan/saya
// Mengembalikan semua laporan yang dibuat oleh user yang sedang login.
// Memerlukan autentikasi (session aktif).
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const laporan = await prisma.laporan.findMany({
      where: { userId },
      select: {
        id: true,
        judul: true,
        alamat: true,
        status: true,
        prioritas: true, // PBI-12
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
        // PBI-10: Include votes untuk cek apakah user sudah vote
        votes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data: tambahkan _hasVoted field (PBI-10)
    const laporanWithVoteStatus = laporan.map((item) => {
      const { votes, ...rest } = item;
      return {
        ...rest,
        _hasVoted: (votes?.length ?? 0) > 0,
      };
    });

    return NextResponse.json(laporanWithVoteStatus);
  } catch (error) {
    console.error('[API /laporan/saya GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}
