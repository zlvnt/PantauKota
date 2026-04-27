import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validasi input menggunakan Zod
const RegisterSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi input
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar, silakan masuk' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru (role default: WARGA)
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Akun berhasil dibuat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /auth/register POST]', error);
    return NextResponse.json(
      { error: 'Terjadi kendala pada sistem' },
      { status: 500 }
    );
  }
}
