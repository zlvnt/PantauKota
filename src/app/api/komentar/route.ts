import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kirimNotifikasi } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET /api/komentar?laporanId=xxx
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const laporanId = req.nextUrl.searchParams.get('laporanId');

  if (!laporanId) {
    return NextResponse.json({ error: 'laporanId diperlukan.' }, { status: 400 });
  }

  const komentar = await prisma.komentar.findMany({
    where: { laporanId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(komentar);
}

// POST /api/komentar
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const body = await req.json();
  const { laporanId, isi } = body;

  if (!laporanId || !isi?.trim()) {
    return NextResponse.json({ error: 'laporanId dan isi diperlukan.' }, { status: 400 });
  }

  const laporan = await prisma.laporan.findUnique({ where: { id: laporanId } });
  if (!laporan) {
    return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
  }

  const komentar = await prisma.komentar.create({
    data: { laporanId, isi: isi.trim(), userId: session.user.id },
    include: { user: { select: { id: true, name: true } } },
  });

  // Kirim notifikasi ke pemilik laporan (kecuali kalau dia yang komentar sendiri)
  if (laporan.userId !== session.user.id) {
    await kirimNotifikasi({
      userId: laporan.userId,
      judul: 'Komentar baru pada laporan Anda',
      pesan: `${session.user.name} berkomentar: ${isi.trim().substring(0, 50)}${isi.trim().length > 50 ? '...' : ''}`,
      laporanId,
    });
  }

  return NextResponse.json(komentar, { status: 201 });
}
