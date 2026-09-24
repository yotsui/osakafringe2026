import { NextResponse } from 'next/server.js';
import type { NextRequest } from 'next/server.js';
import { verifyAuthToken, COOKIE_NAME } from './lib/authCrypto.ts';

// 認証不要で常にアクセスを許可する静的アセット
const PUBLIC_FILE_EXTENSIONS = [
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.css',
  '.js',
  '.map',
  '.webmanifest',
  '.html',
  '.pdf',
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. microCMS下書きプレビュールートの判定（最優先・全体保護OFFや静的ファイル判定より前に実行）
  const isPreviewRoute = pathname === '/preview' || pathname.startsWith('/preview/');

  if (isPreviewRoute) {
    const isPreviewEnabled = process.env.MICROCMS_PREVIEW_ENABLED === 'true';

    // プレビュー機能が無効の場合は 404
    if (!isPreviewEnabled) {
      return new NextResponse('Not Found', {
        status: 404,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
          'Referrer-Policy': 'no-referrer',
        },
      });
    }

    // プレビュー認証用の環境変数検証（明示設定が必須・固定値代用は禁止）
    const expectedPassword = process.env.TEST_SITE_PASSWORD || '';
    const explicitAuthSecret = process.env.TEST_SITE_AUTH_SECRET || '';

    if (!expectedPassword || !explicitAuthSecret) {
      return new NextResponse(
        'Preview configuration error: TEST_SITE_PASSWORD and TEST_SITE_AUTH_SECRET must be configured.',
        {
          status: 503,
          headers: {
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
            'Referrer-Policy': 'no-referrer',
          },
        }
      );
    }

    // 署名付きCookieの検証
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    const isAuthenticated = await verifyAuthToken(sessionCookie, explicitAuthSecret);

    if (isAuthenticated) {
      // 認証済み: プレビュー画面の閲覧を許可
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.headers.set('Referrer-Policy', 'no-referrer');
      response.headers.set('Cache-Control', 'private, no-store');
      return response;
    }

    // 未認証: /password へリダイレクト（returnUrlを保持）
    const returnUrl = `${pathname}${search}`;
    const loginUrl = new URL('/password', request.url);
    loginUrl.searchParams.set('returnUrl', returnUrl);

    const response = NextResponse.redirect(loginUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  // 2. パスワード認証画面、ログアウト画面、および認証・ログアウト用APIのホワイトリスト判定
  if (pathname === '/password' || pathname === '/logout' || pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  const isProtectionEnabled = process.env.TEST_SITE_PROTECTION_ENABLED === 'true';

  // パスワード保護が無効の場合は通常スルー（一般公開通常ページ）
  if (!isProtectionEnabled) {
    return NextResponse.next();
  }

  // 全体保護が有効な場合のNext.js内部リクエストおよび静的ファイルのホワイトリスト判定
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/__next') ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  // 3. 署名付き認証Cookieの検証
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const expectedPassword = process.env.TEST_SITE_PASSWORD || '';
  const authSecret = process.env.TEST_SITE_AUTH_SECRET || expectedPassword || 'default-fallback-secret';

  const isAuthenticated = await verifyAuthToken(sessionCookie, authSecret);

  if (isAuthenticated) {
    // 認証済み: X-Robots-Tag を付与してリクエストを続行
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  // 4. 未認証の場合のハンドリング
  // APIリクエストの場合は 401 Unauthorized JSON を返却
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'このAPIを利用するにはサイトのパスワード認証が必要です。',
        protected: true,
      },
      {
        status: 401,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }

  // 通常ページリクエストの場合は /password へリダイレクト（returnUrlを保持）
  const returnUrl = `${pathname}${search}`;
  const loginUrl = new URL('/password', request.url);
  loginUrl.searchParams.set('returnUrl', returnUrl);

  const response = NextResponse.redirect(loginUrl);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
