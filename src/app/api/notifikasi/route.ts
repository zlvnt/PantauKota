import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifikasi - ambil semua notifikasi milik user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const notifikasi = await prisma.notifikasi.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notifikasi);
}

// PATCH /api/notifikasi - tandai semua notifikasi sebagai dibaca
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id } = body;

  if (id) {
    // Tandai satu notifikasi
    await prisma.notifikasi.updateMany({
      where: { id, userId: session.user.id },
      data: { dibaca: true },
    });
  } else {
    // Tandai semua
    await prisma.notifikasi.updateMany({
      where: { userId: session.user.id, dibaca: false },
      data: { dibaca: true },
    });
  }

  return NextResponse.json({ success: true });
}
