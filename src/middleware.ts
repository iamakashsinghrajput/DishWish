import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ['/dashboard', '/generate-recipe', '/settings'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL('/session/new', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|session/new|signup|forgot-password|reset-password|images).*)',
    // '/dashboard/:path*',
    // '/generate-recipe/:path*',
  ],
};