import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// GET /api/laporan
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

// ─── Schema validasi POST ─────────────────────────────────────────────────────
const CreateLaporanSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter').max(100, 'Judul maksimal 100 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter').max(2000, 'Deskripsi maksimal 2000 karakter'),
  kategoriId: z.string().min(1, 'Kategori harus dipilih'),
  foto: z.array(z.string().url()).min(1, 'Minimal 1 foto').max(5, 'Maksimal 5 foto'),
  latitude: z.number({ error: 'Koordinat lokasi harus diisi' }),
  longitude: z.number({ error: 'Koordinat lokasi harus diisi' }),
  alamat: z.string().optional(),
});

// ─── POST /api/laporan — Buat laporan baru ────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = CreateLaporanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { judul, deskripsi, kategoriId, foto, latitude, longitude, alamat } = result.data;

    const kategori = await prisma.kategori.findUnique({ where: { id: kategoriId } });
    if (!kategori || !kategori.isActive) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const laporan = await prisma.laporan.create({
      data: {
        judul,
        deskripsi,
        kategoriId,
        foto,
        latitude,
        longitude,
        alamat: alamat ?? null,
        status: 'MENUNGGU',
        userId: session.user.id,
      },
      select: {
        id: true,
        judul: true,
        status: true,
        createdAt: true,
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