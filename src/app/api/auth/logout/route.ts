import { NextResponse } from 'next/server.js';
import { COOKIE_NAME } from '../../../../lib/authCrypto.ts';

export async function POST(request: Request) {
  const isHttps = request.url.startsWith('https://') || process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export async function GET(request: Request) {
  const isHttps = request.url.startsWith('https://') || process.env.NODE_ENV === 'production';
  const url = new URL(request.url);
  const redirectUrl = new URL('/password', url.origin);
  redirectUrl.searchParams.set('loggedOut', '1');

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}
