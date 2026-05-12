import { NextRequest, NextResponse } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const protectedRoutes = [
  '/dashboard',
  '/kelola-kategori',
  '/kelola-laporan',
  '/kelola-user',
  '/laporan/buat',
  '/notifikasi',
  '/beranda',
  '/profil',
];

export default async function middleware(request: NextRequest) {
  const result = await updateSupabaseSession(request);
  const response = result instanceof NextResponse ? result : result.response;
  const user = result instanceof NextResponse ? null : result.user;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kelola-kategori/:path*',
    '/kelola-laporan/:path*',
    '/kelola-user/:path*',
    '/laporan/buat',
    '/notifikasi/:path*',
    '/beranda/:path*',
    '/profil/:path*',
  ],
};
