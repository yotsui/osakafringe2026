import { NextResponse } from 'next/server.js';
import {
  verifyPasswordTimingSafe,
  generateAuthToken,
  getSafeReturnUrl,
  COOKIE_NAME,
  SEVEN_DAYS_SECONDS,
} from '../../../../lib/authCrypto.ts';
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit.ts';

export async function POST(request: Request) {
  // 1. IPベースのレート制限（総当たり・ブルートフォース攻撃対策: 1分あたり10回まで）
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`auth:${clientIp}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: '試行回数の上限を超えました。しばらく待ってから再度お試しください。',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';
    const returnUrl = typeof body.returnUrl === 'string' ? body.returnUrl : '/';

    const expectedPassword = process.env.TEST_SITE_PASSWORD || '';
    const authSecret = process.env.TEST_SITE_AUTH_SECRET || expectedPassword || 'default-fallback-secret';

    if (!expectedPassword) {
      console.error('[Auth] TEST_SITE_PASSWORD is not configured in environment variables.');
      return NextResponse.json(
        {
          success: false,
          message: 'サーバーの設定エラーが発生しました。管理者にお問い合わせください。',
        },
        { status: 500 }
      );
    }

    // 2. タイミング攻撃耐性を持つ安全なパスワード照合
    const isMatch = await verifyPasswordTimingSafe(password, expectedPassword);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'パスワードが正しくありません。もう一度お試しください。',
        },
        {
          status: 401,
          headers: {
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        }
      );
    }

    // 3. 署名付き認証トークンの生成
    const token = await generateAuthToken(authSecret);
    const safeReturnUrl = getSafeReturnUrl(returnUrl);

    // 4. レスポンスの構築とHttpOnly Cookieの設定
    const isHttps = request.url.startsWith('https://') || process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      returnUrl: safeReturnUrl,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_SECONDS,
    });

    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: '認証処理中にエラーが発生しました。',
      },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }
}
