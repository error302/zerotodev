import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/utils/auth';

// Add paths that require authentication here
const protectedPaths = ['/dashboard', '/labs', '/learn'];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const payload = await decrypt(session);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
