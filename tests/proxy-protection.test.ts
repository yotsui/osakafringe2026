import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { proxy } from '../src/proxy.ts';
import { generateAuthToken, COOKIE_NAME } from '../src/lib/authCrypto.ts';
import { POST as verifyPasswordPost } from '../src/app/api/auth/verify-password/route.ts';

describe('Site Password Protection & Proxy Flow', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.TEST_SITE_PROTECTION_ENABLED = 'true';
    process.env.TEST_SITE_PASSWORD = 'correct-fringe-password-2026';
    process.env.TEST_SITE_AUTH_SECRET = 'super-secret-key-for-test-32chars!';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('redirects unauthenticated page requests to /password with returnUrl when protection is enabled', async () => {
    const req = new NextRequest('https://osakafringe.com/performances/00oebktvr?tab=schedule');
    const res = await proxy(req);

    assert.equal(res.status, 307); // NextResponse.redirect
    const location = res.headers.get('location');
    assert.ok(location?.includes('/password'));
    assert.ok(location?.includes('returnUrl=%2Fperformances%2F00oebktvr%3Ftab%3Dschedule'));
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  });

  it('blocks unauthenticated API requests with 401 Unauthorized JSON when protection is enabled', async () => {
    const req = new NextRequest('https://osakafringe.com/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    const res = await proxy(req);

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.protected, true);
    assert.equal(data.error, 'Authentication required');
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  });

  it('allows access to whitelisted assets and auth routes without authentication', async () => {
    const publicPaths = [
      'https://osakafringe.com/password',
      'https://osakafringe.com/logout',
      'https://osakafringe.com/api/auth/verify-password',
      'https://osakafringe.com/robots.txt',
      'https://osakafringe.com/favicon.ico',
      'https://osakafringe.com/logo.svg',
      'https://osakafringe.com/_next/static/chunks/app.js',
    ];

    for (const url of publicPaths) {
      const req = new NextRequest(url);
      const res = await proxy(req);
      assert.equal(res.status, 200, `Expected 200 for ${url}, got ${res.status}`);
      assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
    }
  });

  it('rejects incorrect password in verify-password API', async () => {
    const req = new Request('https://osakafringe.com/api/auth/verify-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.4' },
      body: JSON.stringify({ password: 'wrong-password' }),
    });

    const res = await verifyPasswordPost(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes('パスワードが正しくありません'));
  });

  it('authenticates with correct password and sets 7-day HttpOnly cookie', async () => {
    const req = new Request('https://osakafringe.com/api/auth/verify-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.5' },
      body: JSON.stringify({
        password: 'correct-fringe-password-2026',
        returnUrl: '/performances/00oebktvr',
      }),
    });

    const res = await verifyPasswordPost(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.returnUrl, '/performances/00oebktvr');

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie?.includes(`${COOKIE_NAME}=`));
    assert.ok(setCookie?.includes('HttpOnly'));
    assert.ok(setCookie?.includes('Max-Age=604800'));
  });

  it('allows access to protected pages and APIs when valid authentication cookie is provided', async () => {
    const validToken = await generateAuthToken(process.env.TEST_SITE_AUTH_SECRET!);

    const req = new NextRequest('https://osakafringe.com/performances/00oebktvr', {
      headers: {
        cookie: `${COOKIE_NAME}=${validToken}`,
      },
    });

    const res = await proxy(req);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  });

  it('passes all requests normally when TEST_SITE_PROTECTION_ENABLED is false or unset', async () => {
    process.env.TEST_SITE_PROTECTION_ENABLED = 'false';

    const req = new NextRequest('https://osakafringe.com/performances/00oebktvr');
    const res = await proxy(req);

    assert.equal(res.status, 200);
    // When protection is disabled, X-Robots-Tag is not set by proxy
    assert.equal(res.headers.get('X-Robots-Tag'), null);
  });
});
