import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { kirimNotifikasiAdmin } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

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
    const session = await getCurrentSession();
    const userId = session?.user?.id;

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const kategoriId = searchParams.get('kategoriId');
    const search = searchParams.get('search');
    const adminView = searchParams.get('adminView') === 'true';

    // Hitung waktu 24 jam yang lalu
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Build select object dynamically
    const selectObject = {
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
      votes: {
        where: { userId: userId ?? '__anonymous__' },
        select: { id: true },
      },
      ...(adminView
        ? {
            user: { select: { id: true, name: true } },
            selesaiAt: true,
          }
        : {}),
    } satisfies Prisma.LaporanSelect;

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
      const { votes, ...rest } = item;
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

// POST /api/laporan — Buat laporan baru
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { judul, deskripsi, kategoriId, foto, latitude, longitude, alamat } = await req.json();

    if (!judul?.trim() || !deskripsi?.trim() || !kategoriId || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const laporan = await prisma.laporan.create({
      data: {
        userId: session.user.id,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        kategoriId,
        foto: foto ?? [],
        latitude,
        longitude,
        alamat: alamat ?? null,
      },
      select: {
        id: true,
        judul: true,
        kategori: { select: { nama: true } },
        user: { select: { name: true } },
      },
    });

    await kirimNotifikasiAdmin({
      judul: 'Laporan baru masuk',
      pesan: `${laporan.user.name} membuat laporan "${laporan.judul}" pada kategori ${laporan.kategori.nama}.`,
      laporanId: laporan.id,
      excludeUserId: session.user.id,
    });

    return NextResponse.json({ id: laporan.id }, { status: 201 });
  } catch (error) {
    console.error('[API /laporan POST]', error);
    return NextResponse.json({ error: 'Gagal membuat laporan.' }, { status: 500 });
  }
}
