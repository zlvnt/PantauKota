import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kirimNotifikasi } from '@/lib/notifications';
import { kirimEmailNotifikasi } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// GET /api/laporan/[id] — Detail laporan
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const laporan = await prisma.laporan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        latitude: true,
        longitude: true,
        alamat: true,
        status: true,
        voteCount: true,
        foto: true,
        catatanAdmin: true,
        fotoPenyelesaian: true,
        selesaiAt: true,
        createdAt: true,
        updatedAt: true,
        kategori: { select: { id: true, nama: true, icon: true, warna: true } },
        user: { select: { id: true, name: true } },
        _count: { select: { komentar: true } },
      },
    });

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('[API /laporan/[id] GET]', error);
    return NextResponse.json({ error: 'Gagal mengambil laporan.' }, { status: 500 });
  }
}

// PATCH /api/laporan/[id] — Admin update status laporan
const UpdateSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI']).optional(),
  catatanAdmin: z.string().optional(),
  fotoPenyelesaian: z.string().nullable().optional(),
});

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();

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

    const { status, catatanAdmin, fotoPenyelesaian } = result.data;

    const existing = await prisma.laporan.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.laporan.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(catatanAdmin !== undefined ? { catatanAdmin } : {}),
        ...(fotoPenyelesaian !== undefined ? { fotoPenyelesaian } : {}),
        ...(status === 'SELESAI' ? { selesaiAt: new Date() } : {}),
        ...(status !== undefined && status !== 'SELESAI' ? { selesaiAt: null } : {}),
      },
      select: {
        id: true,
        judul: true,
        status: true,
        voteCount: true,
        selesaiAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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

      // Kirim email notifikasi (fire-and-forget, no await to keep API fast)
      if (updated.user?.email) {
        kirimEmailNotifikasi(
          updated.user.email,
          updated.user.name || 'Warga',
          updated.judul,
          STATUS_LABEL[updated.status],
          updated.id
        );
      }
    }



    return NextResponse.json({
      id: updated.id,
      status: updated.status,
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
  const session = await getCurrentSession();
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
