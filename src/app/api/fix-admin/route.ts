import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API untuk memperbaiki status admin
export async function GET() {
  try {
    // Cari admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@pantaukota.id' },
    });

    if (!admin) {
      return NextResponse.json({ 
        message: 'Admin user tidak ditemukan',
        found: false 
      });
    }

    // Update admin menjadi aktif jika belum aktif
    if (!admin.isActive) {
      const updatedAdmin = await prisma.user.update({
        where: { id: admin.id },
        data: { isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      return NextResponse.json({ 
        message: 'Admin user berhasil diperbaiki',
        found: true,
        wasInactive: true,
        admin: updatedAdmin
      });
    }

    return NextResponse.json({ 
      message: 'Admin user sudah aktif',
      found: true,
      wasInactive: false,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Error fixing admin status:', error);
    return NextResponse.json({ 
      message: 'Terjadi kesalahan server',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
