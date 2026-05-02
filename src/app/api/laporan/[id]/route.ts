import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/laporan/[id] — Ambil detail satu laporan (PBI-11 Status Tracking)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const laporan = await prisma.laporan.findUnique({
      where: { id: params.id },
      include: {
        kategori: { select: { id: true, nama: true, icon: true, warna: true } },
        user: { select: { id: true, name: true } },
        _count: { select: { komentar: true } },
        votes: {
          where: { userId: userId ?? '' }, // always include field; empty string = no match when unauthenticated
          select: { id: true },
        },
      },
    });

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const { votes, ...rest } = laporan;
    return NextResponse.json({
      ...rest,
      _hasVoted: userId ? votes.length > 0 : false,
    });
  } catch (error) {
    console.error('[API /laporan/[id] GET]', error);
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}

// PATCH /api/laporan/[id] — Admin update status / prioritas laporan
const UpdateSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI']).optional(),
  prioritas: z.boolean().optional(),
  catatanAdmin: z.string().optional(),
  fotoPenyelesaian: z.string().optional(),
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

    const { status, prioritas, catatanAdmin, fotoPenyelesaian } = result.data;

    const updated = await prisma.laporan.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(prioritas !== undefined ? { prioritas } : {}),
        ...(catatanAdmin !== undefined ? { catatanAdmin } : {}),
<<<<<<< Updated upstream
        // Set selesaiAt saat status berubah ke SELESAI
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        // Reset selesaiAt jika status dikembalikan
        ...(status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
      select: { id: true, status: true, selesaiAt: true },
    });

    return NextResponse.json(updated);
=======
        ...(fotoPenyelesaian !== undefined ? { fotoPenyelesaian } : {}),
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        ...(status && status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
    });

    // Kirim notifikasi hanya jika status berubah
    if (status !== undefined) {
      await kirimNotifikasi({
        userId: updated.userId,
        judul: `Status laporan diperbarui`,
        pesan: `Laporan "${updated.judul}" kini berstatus: ${STATUS_LABEL[updated.status]}.`,
        laporanId: updated.id,
      });
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      prioritas: (updated as any).prioritas,
      selesaiAt: updated.selesaiAt,
    });
>>>>>>> Stashed changes
  } catch (error) {
    console.error('[API /laporan/[id] PATCH]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui laporan' },
      { status: 500 }
    );
  }
}
