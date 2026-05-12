import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(session);
}
