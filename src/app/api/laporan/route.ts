import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/laporan
// Query params:
//   ?status=MENUNGGU|DIPROSES|SELESAI   (opsional)
//   ?kategoriId=xxx                      (opsional)
//   ?search=kata kunci                   (opsional)
//   ?adminView=true                      (opsional, tambahkan nama pelapor)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') as 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | null;
    const kategoriId = searchParams.get('kategoriId');
    const search = searchParams.get('search');
    const adminView = searchParams.get('adminView') === 'true';

    // Ambil laporan dengan select yang selalu konsisten
    const laporan = await prisma.laporan.findMany({
      where: {
        ...(status ? { status } : {}),
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
      include: {
        kategori: {
          select: { id: true, nama: true, icon: true, warna: true },
        },
        user: {
          select: { id: true, name: true },
        },
        votes: {
          where: userId ? { userId } : { userId: '' }, // always include field, filter by userId or empty
          select: { id: true },
        },
        _count: {
          select: { komentar: true },
        },
      },
      orderBy: [
        { prioritas: 'desc' },   // PBI-12: laporan prioritas selalu di atas
        { createdAt: 'desc' },
      ] as any,
    });

    // Transform: tambahkan _hasVoted, sembunyikan votes & user jika bukan adminView
    const result = laporan.map((item) => {
      const { votes, user, ...rest } = item as any;
      return {
        ...rest,
        ...(adminView ? { user } : {}),
        _hasVoted: userId ? votes.length > 0 : false,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /laporan GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}

const createLaporanSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  kategoriId: z.string().min(1, 'Kategori harus dipilih'),
  latitude: z.number(),
  longitude: z.number(),
  alamat: z.string().optional(),
  foto: z.array(z.string()).optional().default([]),
});

// POST /api/laporan
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createLaporanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const laporan = await prisma.laporan.create({
      data: {
        userId: session.user.id,
        judul: data.judul,
        deskripsi: data.deskripsi,
        kategoriId: data.kategoriId,
        latitude: data.latitude,
        longitude: data.longitude,
        alamat: data.alamat || '',
        foto: data.foto,
        status: 'MENUNGGU',
        voteCount: 0,
      },
    });

    return NextResponse.json(laporan, { status: 201 });
  } catch (error) {
    console.error('[API /laporan POST]', error);
    return NextResponse.json(
      { error: 'Gagal membuat laporan' },
      { status: 500 }
    );
  }
}
