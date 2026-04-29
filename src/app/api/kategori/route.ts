import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kategori
// Mengembalikan semua kategori yang masih aktif (isActive = true).
// Digunakan untuk filter chips di halaman peta.
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nama: true,
        icon: true,
        warna: true,
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error('[API /kategori GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}
