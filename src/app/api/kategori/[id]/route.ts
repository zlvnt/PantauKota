import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Guard admin ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== 'ADMIN') return null;
  return session;
}

// PATCH /api/kategori/[id] — Edit nama/icon/warna ATAU toggle isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }

    const body = await req.json();
    const { nama, icon, warna, isActive } = body;

    // Cek kategori ada
    const existing = await prisma.kategori.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    // Jika update nama, cek tidak duplikat dengan kategori lain
    if (nama !== undefined && nama.trim() !== existing.nama) {
      const duplikat = await prisma.kategori.findUnique({ where: { nama: nama.trim() } });
      if (duplikat) {
        return NextResponse.json(
          { error: 'Kategori dengan nama ini sudah ada.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.kategori.update({
      where: { id: params.id },
      data: {
        ...(nama !== undefined && { nama: nama.trim() }),
        ...(icon !== undefined && { icon: icon?.trim() || null }),
        ...(warna !== undefined && { warna: warna?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        nama: true,
        icon: true,
        warna: true,
        isActive: true,
        createdAt: true,
        _count: { select: { laporan: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API /kategori/[id] PATCH]', error);
    return NextResponse.json({ error: 'Gagal memperbarui kategori.' }, { status: 500 });
  }
}

// DELETE /api/kategori/[id] — Hapus kategori (hanya jika tidak ada laporan terkait)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }

    // Cek kategori ada
    const existing = await prisma.kategori.findUnique({
      where: { id: params.id },
      include: { _count: { select: { laporan: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    // Tolak hapus jika ada laporan yang menggunakan kategori ini
    if (existing._count.laporan > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus kategori. Ada ${existing._count.laporan} laporan yang menggunakan kategori ini. Nonaktifkan saja jika tidak ingin dipakai lagi.`,
        },
        { status: 409 }
      );
    }

    await prisma.kategori.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /kategori/[id] DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
