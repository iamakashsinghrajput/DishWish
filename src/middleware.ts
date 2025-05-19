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



import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  // Define paths that do not require authentication
  const publicPaths = [
    '/',
    '/session/new',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/how-it-works',
    '/about',
  ];

  const isPublicPath = publicPaths.some(path => 
    pathname === path || (path.endsWith('*') && pathname.startsWith(path.slice(0, -1)))
  );

  // Allow requests to public paths and NextAuth API routes to pass through without token check
  if (isPublicPath || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // For all other paths, check for a token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // If no token, redirect to login page
    // Preserve the original path for redirection after login
    const loginUrl = new URL('/session/new', origin); // Use origin for base URL
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    console.log(`Middleware: No token, redirecting to ${loginUrl.toString()}`);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /images/ (if you have a public images folder, adjust as needed or handle via publicPaths)
     * - /public/ (if you serve other files directly from public, adjust)
     *
     * This matcher is broad. The logic inside the middleware then decides based on publicPaths.
     * API routes starting with /api/ but NOT /api/auth/ will be caught by this and checked for a token.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};