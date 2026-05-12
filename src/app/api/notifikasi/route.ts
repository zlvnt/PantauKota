import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/notifikasi - ambil semua notifikasi milik user
export async function GET() {
  const session = await getCurrentSession();
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
  const session = await getCurrentSession();
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

// DELETE /api/notifikasi?id=xxx - hapus satu notifikasi milik user
export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID notifikasi diperlukan.' }, { status: 400 });
  }

  await prisma.notifikasi.deleteMany({
    where: { id, userId: session.user.id }, // pastikan hanya bisa hapus milik sendiri
  });

  return NextResponse.json({ success: true });
}
