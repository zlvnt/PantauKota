import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Radius deteksi duplikasi dalam kilometer
const RADIUS_KM = 0.5;

// Hitung jarak antara 2 titik koordinat (Haversine formula)
function hitungJarak(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { latitude, longitude, kategoriId } = body;

    if (!latitude || !longitude || !kategoriId) {
      return NextResponse.json(
        { error: "latitude, longitude, dan kategoriId wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil semua laporan dengan kategori yang sama yang belum selesai
    const laporanExisting = await prisma.laporan.findMany({
      where: {
        kategoriId,
        status: { in: ["MENUNGGU", "DIPROSES"] },
      },
      select: {
        id: true,
        judul: true,
        status: true,
        latitude: true,
        longitude: true,
        alamat: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    // Filter laporan yang jaraknya dalam radius
    const duplikat = laporanExisting.filter((laporan) => {
      const jarak = hitungJarak(latitude, longitude, laporan.latitude, laporan.longitude);
      return jarak <= RADIUS_KM;
    });

    if (duplikat.length === 0) {
      return NextResponse.json({ duplikat: false, laporan: [] });
    }

    return NextResponse.json({
      duplikat: true,
      jumlah: duplikat.length,
      laporan: duplikat.map((l) => ({
        id: l.id,
        judul: l.judul,
        status: l.status,
        alamat: l.alamat,
        pelapor: l.user.name,
        tanggal: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("[API /laporan/cek-duplikasi]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
