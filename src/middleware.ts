import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  const publicPaths = [
    '/',                     // Homepage
    '/session/new',          // Login page
    '/signup/new',           // Initial signup page
    '/signup/verify-email-otp',// OTP verification for signup
    '/signup/complete-profile',// Profile completion after OTP
    '/signup/verify-email',  // Generic "check your email" page (if used)
    '/forgot-password',      // Forgot password page
    '/reset-password',       // Reset password page (accessed via token link)
    '/how-it-works',
    '/about',
    '/contact',              // Assuming contact page is public
    '/api/generate-recipe',
  ];

  const publicApiPrefixes = [
    '/api/auth/',            // All NextAuth routes (signin, callback, signout, session, etc.)
    '/api/contact',          // Contact form submission API (if public)
  ];

  const isExplicitPublicPath = publicPaths.includes(pathname);
  const isPublicApiRoute = publicApiPrefixes.some(prefix => pathname.startsWith(prefix));
    if (isExplicitPublicPath || isPublicApiRoute) {
    return NextResponse.next();
  }
  
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL('/session/new', origin);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error('Middleware token error:', error);
    const loginUrl = new URL('/session/new', origin);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
