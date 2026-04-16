import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through everything for now until Auth is implemented
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
