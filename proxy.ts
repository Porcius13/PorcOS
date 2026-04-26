import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;

  // Paths that don't need authentication
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/auth');

  if (isAuthPage || isPublicApi) {
    // If logged in, redirect away from the login page to the dashboard.
    if (isAuthPage && authToken === 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Verify authentication token.
  if (!authToken || authToken !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicon files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
