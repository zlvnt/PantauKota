import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/beranda';
  }

  return value;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = getSafeNextPath(url.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid-confirmation', url.origin));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=confirmation-failed', url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
