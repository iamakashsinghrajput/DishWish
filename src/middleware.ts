import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ['/dashboard', '/generate-recipe', '/settings'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
      });

      console.log('Middleware - Path:', pathname, 'Token exists:', !!token);

      if (!token) {
        console.log('Middleware - No token found, redirecting to login');
        const loginUrl = new URL('/session/new', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Middleware - Error getting token:', error);
      const loginUrl = new URL('/session/new', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate-recipe',
    '/settings/:path*',
  ],
};