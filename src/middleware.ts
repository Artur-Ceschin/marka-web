import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+')).replace(/_/g, '/'));

    const expired = (payload.exp as number) * 1000 < Date.now();
    if (expired) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  } catch {
    NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/identify/:path*',
    '/explore/:path*',
    '/notebook/:path*',
    '/feed/:path*',
    '/profile/:path*',
  ],
};
