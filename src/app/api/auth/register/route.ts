import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

function getAppUrl(req: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');

  if (forwardedHost) {
    return `${forwardedProto ?? 'https'}://${forwardedHost}`;
  }

  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, password } = result.data;
    const email = result.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar, silakan masuk' },
        { status: 409 }
      );
    }

    const supabase = createSupabaseServerClient();
    const emailRedirectTo = `${getAppUrl(req)}/auth/callback?next=/beranda`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { name, role: 'WARGA' },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Gagal membuat akun Supabase Auth' },
        { status: 400 }
      );
    }

    await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return NextResponse.json(
      {
        message: 'Akun berhasil dibuat',
        needsEmailConfirmation: !data.session,
      },
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
