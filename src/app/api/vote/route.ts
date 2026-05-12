import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PRIORITY_THRESHOLD } from '@/lib/constants';
import { kirimNotifikasiDaruratAdmin } from '@/lib/notifications';
import { calculatePriorityScore } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/vote — Toggle vote/unvote laporan
 * 
 * Body: { laporanId: string }
 * Response: { voted: boolean, voteCount: number }
 * 
 * Fitur:
 * - TIDAK ADA batasan vote per hari (user bisa vote unlimited)
 * - Toggle vote (jika sudah vote, akan unvote)
 * - Atomic transaction untuk data consistency
 * 
 * Catatan: Batasan 3x per hari hanya untuk MEMBUAT laporan, bukan vote
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { laporanId } = body;

    if (!laporanId || typeof laporanId !== 'string') {
      return NextResponse.json(
        { error: 'laporanId wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah laporan ada
    const laporan = await prisma.laporan.findUnique({
      where: { id: laporanId },
      select: {
        id: true,
        judul: true,
        status: true,
        prioritas: true,
        voteCount: true,
        createdAt: true,
      },
    });

    if (!laporan) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    const userId = session.user.id;

    // Cek apakah user sudah pernah vote laporan ini
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_laporanId: { userId, laporanId },
      },
    });

    if (existingVote) {
      // ── UNVOTE: Hapus vote + decrement voteCount ──
      await prisma.$transaction([
        prisma.vote.delete({
          where: { id: existingVote.id },
        }),
        prisma.laporan.update({
          where: { id: laporanId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      // Ambil voteCount terbaru
      const updated = await prisma.laporan.findUnique({
        where: { id: laporanId },
        select: { voteCount: true },
      });

      return NextResponse.json({
        voted: false,
        voteCount: updated?.voteCount ?? 0,
      });
    } else {
      // ── VOTE: Langsung buat vote baru tanpa cek batas ──
      const previousScore = calculatePriorityScore(laporan.voteCount, laporan.createdAt);

      await prisma.$transaction([
        prisma.vote.create({
          data: { userId, laporanId },
        }),
        prisma.laporan.update({
          where: { id: laporanId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      // Ambil voteCount terbaru
      const updated = await prisma.laporan.findUnique({
        where: { id: laporanId },
        select: { voteCount: true, createdAt: true },
      });

      const nextVoteCount = updated?.voteCount ?? 0;
      const nextScore = calculatePriorityScore(
        nextVoteCount,
        updated?.createdAt ?? laporan.createdAt
      );

      if (
        laporan.status !== 'SELESAI' &&
        !laporan.prioritas &&
        previousScore < PRIORITY_THRESHOLD &&
        nextScore >= PRIORITY_THRESHOLD
      ) {
        await kirimNotifikasiDaruratAdmin({
          laporanId,
          judulLaporan: laporan.judul,
          pesan: `Skor prioritas laporan mencapai ${nextScore}`,
          excludeUserId: userId,
        });
      }

      return NextResponse.json({
        voted: true,
        voteCount: nextVoteCount,
      });
    }
  } catch (error) {
    console.error('[API /vote POST]', error);
    return NextResponse.json(
      { error: 'Terjadi kendala pada sistem' },
      { status: 500 }
    );
  }
}
