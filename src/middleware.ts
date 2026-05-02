import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/kelola-kategori') ||
      path.startsWith('/kelola-laporan')
    ) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kelola-kategori/:path*',
    '/kelola-laporan/:path*',
    '/laporan/buat',
    '/notifikasi/:path*',
    '/beranda/:path*',
    '/profil/:path*',
  ],
};
