
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// NOTE: This is a conceptual middleware.
// Firebase Auth state is typically managed client-side or with server-side helpers (like NextAuth.js with Firebase Adapter).
// Directly accessing Firebase Auth state (like auth.currentUser) in Edge Middleware is not straightforward
// because Edge Middleware runs in a different environment.
//
// For a real Firebase app, you'd typically:
// 1. Use cookies to store auth tokens (ID tokens).
// 2. Verify these tokens in middleware (requires a serverless function or API route if using Firebase Admin SDK for verification).
// 3. Or, rely more on client-side routing protection combined with Firestore security rules.
//
// This mock middleware simulates protection based on URL paths.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get('mockAuthToken')?.value === 'true'; // Example: check for a mock auth cookie
  const userRole = request.cookies.get('mockUserRole')?.value; // Example: 'patient' or 'doctor'

  // Redirect to login if trying to access protected routes and not authenticated
  if ((pathname.startsWith('/patient') || pathname.startsWith('/doctor')) && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('message', 'يرجى تسجيل الدخول للمتابعة.');
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (isAuthenticated) {
    if (pathname.startsWith('/patient') && userRole !== 'patient') {
      const deniedUrl = new URL('/auth/login', request.url);
      deniedUrl.searchParams.set('message', 'الوصول مرفوض. هذه الصفحة مخصصة للمرضى.');
      return NextResponse.redirect(deniedUrl);
    }
    if (pathname.startsWith('/doctor') && userRole !== 'doctor') {
       const deniedUrl = new URL('/auth/login', request.url);
      deniedUrl.searchParams.set('message', 'الوصول مرفوض. هذه الصفحة مخصصة للأطباء.');
      return NextResponse.redirect(deniedUrl);
    }
    // If authenticated and trying to access auth pages (login/signup), redirect to dashboard
    if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
        if (userRole === 'patient') return NextResponse.redirect(new URL('/patient/dashboard', request.url));
        if (userRole === 'doctor') return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
        return NextResponse.redirect(new URL('/', request.url)); // Fallback to home
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder if you have one)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
