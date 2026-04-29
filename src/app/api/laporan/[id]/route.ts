import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kirimNotifikasi } from '@/lib/notifications';
import { z } from 'zod';

// PATCH /api/laporan/[id] — Admin update status laporan (aksi cepat dari peta)
const UpdateSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI']),
  catatanAdmin: z.string().optional(),
});

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Sedang Diproses',
  SELESAI: 'Selesai',
};

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
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        ...(status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
      select: {
        id: true,
        judul: true,
        status: true,
        selesaiAt: true,
        userId: true,       // untuk tahu ke siapa notifikasi dikirim
      },
    });

    // Kirim notifikasi real-time ke pemilik laporan
    await kirimNotifikasi({
      userId: updated.userId,
      judul: `Status laporan diperbarui`,
      pesan: `Laporan "${updated.judul}" kini berstatus: ${STATUS_LABEL[updated.status]}.`,
      laporanId: updated.id,
    });

    return NextResponse.json({ id: updated.id, status: updated.status, selesaiAt: updated.selesaiAt });
  } catch (error) {
    console.error('[API /laporan/[id] PATCH]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui laporan' },
      { status: 500 }
    );
  }
}

