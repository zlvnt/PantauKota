import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/laporan/saya
// Mengembalikan semua laporan yang dibuat oleh user yang sedang login.
// Memerlukan autentikasi (session aktif).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan' },
        { status: 401 }
      );
    }

    const laporan = await prisma.laporan.findMany({
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

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('[API /laporan/saya GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}
