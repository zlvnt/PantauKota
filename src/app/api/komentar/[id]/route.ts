import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE /api/komentar/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const komentar = await prisma.komentar.findUnique({ where: { id: params.id } });

  if (!komentar) {
    return NextResponse.json({ error: 'Komentar tidak ditemukan.' }, { status: 404 });
  }

  const isOwner = komentar.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
  }

  await prisma.komentar.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
