import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/komentar?laporanId=xxx
export async function GET(req: NextRequest) {
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
  const session = await getServerSession(authOptions);
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

  return NextResponse.json(komentar, { status: 201 });
}
