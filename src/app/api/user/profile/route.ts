import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema untuk update profil
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password minimal 6 karakter').optional(),
});

// GET - Ambil data profil user
export async function GET() {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PATCH - Update profil user
export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validasi input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validasi gagal', 
        errors: validation.error.issues 
      }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = validation.data;

    // Ambil user saat ini
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah nama sudah digunakan oleh user lain
    if (name !== currentUser.name) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: name,
          id: { not: session.user.id }, // Exclude current user
        },
      });

      if (existingUser) {
        return NextResponse.json({ 
          message: 'Nama sudah digunakan oleh pengguna lain' 
        }, { status: 400 });
      }
    }

    // Siapkan data update
    const updateData: { name: string } = { name };

    // Jika ingin mengubah password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Password saat ini diperlukan' }, { status: 400 });
      }

      const supabase = createSupabaseServerClient();
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (verifyError) {
        return NextResponse.json({ message: 'Password saat ini salah' }, { status: 400 });
      }

      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updatePasswordError) {
        return NextResponse.json({ message: 'Gagal memperbarui password' }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
