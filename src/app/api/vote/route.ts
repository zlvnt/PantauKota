import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  const session = await getServerSession(authOptions);

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
      select: { id: true },
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
        select: { voteCount: true },
      });

      return NextResponse.json({
        voted: true,
        voteCount: updated?.voteCount ?? 0,
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
