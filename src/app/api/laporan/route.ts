import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/laporan
// Query params:
//   ?status=MENUNGGU|DIPROSES|SELESAI   (opsional, untuk PBI-02 Filter)
//   ?kategoriId=xxx                      (opsional, untuk PBI-02 Filter)
//   ?search=kata kunci                   (opsional, untuk PBI-02 Search)
//   ?adminView=true                      (opsional, tambahkan nama pelapor & tanggal)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const kategoriId = searchParams.get('kategoriId');
    const search = searchParams.get('search');
    const adminView = searchParams.get('adminView') === 'true';

    const laporan = await prisma.laporan.findMany({
      where: {
        ...(status ? { status: status as 'MENUNGGU' | 'DIPROSES' | 'SELESAI' } : {}),
        ...(kategoriId ? { kategoriId } : {}),
        ...(search
          ? {
              OR: [
                { judul: { contains: search, mode: 'insensitive' } },
                { deskripsi: { contains: search, mode: 'insensitive' } },
                { alamat: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        judul: true,
        latitude: true,
        longitude: true,
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
        // Hanya tampilkan data pelapor untuk admin
        ...(adminView
          ? { user: { select: { id: true, name: true } } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('[API /laporan GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}

