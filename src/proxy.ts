import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session-cookie';

/**
 * Early redirects for staff areas, based on the signed session cookie. This is a
 * convenience so people land on the right page; the real authorization check
 * (including whether the account is still active) runs in src/lib/dal.ts on
 * every page and action.
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (request.nextUrl.pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/publisher', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/publisher/:path*', '/admin/:path*'],
};
