// import { getToken } from 'next-auth/jwt';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const protectedPaths = ['/dashboard', '/generate-recipe', '/settings'];
//   const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

//   if (isProtectedPath) {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//     if (!token) {
//       const loginUrl = new URL('/session/new', req.url);
//       loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
//       return NextResponse.redirect(loginUrl);
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|session/new|signup|forgot-password|reset-password|images).*)',
//     // '/dashboard/:path*',
//     // '/generate-recipe/:path*',
//   ],
// };



// src/middleware.ts
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

  // API routes for authentication and public data
  const publicApiPrefixes = [
    '/api/auth/',            // All NextAuth routes (signin, callback, signout, session, etc.)
    '/api/contact',          // Contact form submission API (if public)
    // Add other public API prefixes if any
  ];

  // Check if the current path is one of the explicitly defined public paths
  const isExplicitPublicPath = publicPaths.includes(pathname);

  // Check if the current path starts with one of the public API prefixes
  const isPublicApiRoute = publicApiPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isExplicitPublicPath || isPublicApiRoute) {
    // console.log(`Middleware: Allowing public path or public API: ${pathname}`);
    return NextResponse.next();
  }
  
  // For all other paths, check for an authentication token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // If no token and it's not a public path, redirect to login
    const loginUrl = new URL('/session/new', origin);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    console.log(`Middleware: No token for protected path ${pathname}, redirecting to ${loginUrl.toString()}`);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, allow the request to proceed
  // console.log(`Middleware: Token found for protected path ${pathname}, allowing.`);
  return NextResponse.next();
}

// Configuration for which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any other static assets in /public you want to exclude directly (e.g., /images/, /fonts/)
     *
     * This broad matcher ensures the middleware logic above determines access.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth-graphic.svg).*)', 
    // Added auth-graphic.svg to exclude it if it's in public root.
    // Adjust if you have other top-level public assets not in a subfolder.
  ],
};