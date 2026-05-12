import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/kategori
// Query params:
//   ?all=true   → Semua kategori (aktif + nonaktif), khusus admin halaman kelola-kategori
//   (default)   → Hanya isActive: true, untuk filter peta & form laporan
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get('all') === 'true';

    // ?all=true hanya untuk admin — validasi sesi
    if (all) {
      const session = await getCurrentSession();
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
      }
    }

    const kategori = await prisma.kategori.findMany({
      where: all ? undefined : { isActive: true },
      select: {
        id: true,
        nama: true,
        icon: true,
        warna: true,
        isActive: true,
        createdAt: true,
        _count: { select: { laporan: true } },
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error('[API /kategori GET]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// POST /api/kategori — Tambah kategori baru (khusus admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 403 });
    }

    const { nama, icon, warna } = await req.json();

    if (!nama?.trim()) {
      return NextResponse.json({ error: 'Nama kategori tidak boleh kosong.' }, { status: 400 });
    }

    // Cek duplikat nama
    const existing = await prisma.kategori.findUnique({ where: { nama: nama.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Kategori dengan nama ini sudah ada.' }, { status: 409 });
    }

    const kategori = await prisma.kategori.create({
      data: {
        nama: nama.trim(),
        icon: icon?.trim() || null,
        warna: warna?.trim() || null,
        isActive: true,
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

    return NextResponse.json(kategori, { status: 201 });
  } catch (error) {
    console.error('[API /kategori POST]', error);
    return NextResponse.json({ error: 'Gagal membuat kategori.' }, { status: 500 });
  }
}
