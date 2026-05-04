import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kirimNotifikasi } from '@/lib/notifications';
import { z } from 'zod';

// PATCH /api/laporan/[id] — Admin update status atau prioritas laporan
const UpdateSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI']).optional(),
  prioritas: z.boolean().optional(),
  catatanAdmin: z.string().optional(),
  fotoPenyelesaian: z.string().nullable().optional(),
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

    const { status, prioritas, catatanAdmin, fotoPenyelesaian } = result.data;

    const updated = await prisma.laporan.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(prioritas !== undefined ? { prioritas } : {}),
        ...(catatanAdmin !== undefined ? { catatanAdmin } : {}),
        ...(fotoPenyelesaian !== undefined ? { fotoPenyelesaian } : {}),
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        ...(status !== undefined && status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
      select: {
        id: true,
        judul: true,
        status: true,
        prioritas: true,
        selesaiAt: true,
        userId: true,
      },
    });

    // Kirim notifikasi ke pemilik laporan jika status berubah
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
      prioritas: updated.prioritas,
      selesaiAt: updated.selesaiAt,
    });
  } catch (error) {
    console.error('[API /laporan/[id] PATCH]', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui laporan' },
      { status: 500 }
    );
  }
}

// DELETE /api/laporan/[id]
// Ketentuan: hanya pemilik laporan, dalam 24 jam sejak dibuat, dan status masih MENUNGGU
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const laporan = await prisma.laporan.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, status: true, createdAt: true },
    });

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    // Hanya pemilik laporan yang boleh menghapus
    if (laporan.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk menghapus laporan ini.' },
        { status: 403 }
      );
    }

    // Laporan yang sudah diproses tidak dapat dihapus
    if (laporan.status !== 'MENUNGGU') {
      return NextResponse.json(
        { error: 'Laporan tidak dapat dihapus karena sudah diproses oleh admin.' },
        { status: 403 }
      );
    }

    // Cek batas waktu 24 jam sejak diunggah
    const batasWaktu = new Date(laporan.createdAt.getTime() + 24 * 60 * 60 * 1000);
    if (new Date() > batasWaktu) {
      return NextResponse.json(
        { error: 'Laporan tidak dapat dihapus karena sudah lebih dari 24 jam sejak diunggah.' },
        { status: 403 }
      );
    }

    // Hapus semua relasi lalu hapus laporan dalam satu transaksi
    await prisma.$transaction([
      prisma.komentar.deleteMany({ where: { laporanId: params.id } }),
      prisma.vote.deleteMany({ where: { laporanId: params.id } }),
      prisma.notifikasi.deleteMany({ where: { laporanId: params.id } }),
      prisma.laporan.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /laporan/[id] DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus laporan.' }, { status: 500 });
  }
}
