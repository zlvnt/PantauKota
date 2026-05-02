import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/laporan
// Query params:
//   ?status=MENUNGGU|DIPROSES|SELESAI   (opsional, untuk PBI-02 Filter)
//   ?kategoriId=xxx                      (opsional, untuk PBI-02 Filter)
//   ?search=kata kunci                   (opsional, untuk PBI-02 Search)
//   ?adminView=true                      (opsional, tambahkan nama pelapor & tanggal)
//
// Auto-hide: Laporan SELESAI > 24 jam otomatis hilang dari peta
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const kategoriId = searchParams.get('kategoriId');
    const search = searchParams.get('search');
    const adminView = searchParams.get('adminView') === 'true';

    // Hitung waktu 24 jam yang lalu
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Build select object dynamically
    const selectObject: any = {
      id: true,
      judul: true,
      latitude: true,
      longitude: true,
      alamat: true,
      status: true,
      prioritas: true, // PBI-12: Include prioritas field
      voteCount: true,
      createdAt: true,
      foto: true,
      kategori: {
        select: { id: true, nama: true, icon: true, warna: true },
      },
      _count: {
        select: { komentar: true },
      },
    };

    // PBI-10: Include votes hanya jika user login
    if (userId) {
      selectObject.votes = {
        where: { userId },
        select: { id: true },
      };
    }

    // Hanya tampilkan data pelapor untuk admin
    if (adminView) {
      selectObject.user = { select: { id: true, name: true } };
      selectObject.selesaiAt = true; // Untuk cek 24 jam
    }

    const laporan = await prisma.laporan.findMany({
      where: {
        AND: [
          // Filter status (jika ada)
          ...(status ? [{ status: status as 'MENUNGGU' | 'DIPROSES' | 'SELESAI' }] : []),
          
          // Filter kategori (jika ada)
          ...(kategoriId ? [{ kategoriId }] : []),
          
          // Filter search (jika ada)
          ...(search
            ? [{
                OR: adminView ? [
                  { judul: { contains: search, mode: 'insensitive' as const } },
                  { deskripsi: { contains: search, mode: 'insensitive' as const } },
                  { alamat: { contains: search, mode: 'insensitive' as const } },
                  { user: { name: { contains: search, mode: 'insensitive' as const } } },
                ] : [
                  { judul: { contains: search, mode: 'insensitive' as const } },
                  { deskripsi: { contains: search, mode: 'insensitive' as const } },
                  { alamat: { contains: search, mode: 'insensitive' as const } },
                ],
              }]
            : []),
          
          // ✨ AUTO-HIDE: Exclude laporan SELESAI > 24 jam dari peta
          // Logic: Tampilkan jika (BELUM SELESAI) ATAU (SELESAI tapi < 24 jam)
          {
            OR: [
              // Tampilkan semua laporan yang belum selesai
              { status: { not: 'SELESAI' } },
              
              // Tampilkan laporan SELESAI yang masih < 24 jam
              { 
                status: 'SELESAI',
                selesaiAt: { 
                  gte: twentyFourHoursAgo 
                }
              }
            ]
          }
        ]
      },
      select: selectObject,
      orderBy: [
        { prioritas: 'desc' }, // PBI-12: Prioritas dulu
        { createdAt: 'desc' }, // Lalu terbaru
      ],
    });

    // Transform data: tambahkan _hasVoted field (PBI-10)
    const laporanWithVoteStatus = laporan.map((item) => {
      const { votes, ...rest } = item as any;
      return {
        ...rest,
        _hasVoted: userId ? (votes?.length ?? 0) > 0 : false,
      };
    });

    return NextResponse.json(laporanWithVoteStatus);
  } catch (error) {
    console.error('[API /laporan GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}

