import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ─── GET /api/laporan/[id] — Ambil detail laporan ─────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laporan = await prisma.laporan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        foto: true,
        latitude: true,
        longitude: true,
        alamat: true,
        status: true,
        voteCount: true,
        catatanAdmin: true,
        fotoPenyelesaian: true,
        selesaiAt: true,
        createdAt: true,
        kategori: {
          select: { id: true, nama: true, icon: true, warna: true },
        },
        user: {
          select: { id: true, name: true },
        },
        _count: {
          select: { komentar: true },
        },
      },
    });

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('[API /laporan/[id] GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}


// PATCH /api/laporan/[id] — Admin update status laporan (aksi cepat dari peta)
const UpdateSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI']),
  catatanAdmin: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = UpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, catatanAdmin } = result.data;

    const updated = await prisma.laporan.update({
      where: { id: params.id },
      data: {
        status,
        ...(catatanAdmin !== undefined ? { catatanAdmin } : {}),
        // Set selesaiAt saat status berubah ke SELESAI
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        // Reset selesaiAt jika status dikembalikan
        ...(status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
      select: { id: true, status: true, selesaiAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API /laporan/[id] PATCH]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui laporan' },
      { status: 500 }
    );
  }
}
