import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { proxy } from '../src/proxy.ts';
import {
  generateAuthToken,
  COOKIE_NAME,
  isServerPreviewAuthenticated,
} from '../src/lib/authCrypto.ts';
import { POST as verifyPasswordPost } from '../src/app/api/auth/verify-password/route.ts';
import {
  getDraftPerformanceById,
  DraftPreviewError,
} from '../src/lib/microcms.ts';
import { shouldBlockAnalytics } from '../src/utils/analyticsUtils.ts';

describe('microCMS Draft Preview & Authentication Protection', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.MICROCMS_PREVIEW_ENABLED = 'true';
    process.env.TEST_SITE_PROTECTION_ENABLED = 'false';
    process.env.TEST_SITE_PASSWORD = 'fringe-preview-password-2026';
    process.env.TEST_SITE_AUTH_SECRET = 'random-auth-secret-key-min-32-chars-long!';
    process.env.MICROCMS_SERVICE_DOMAIN = 'test-fringe-domain';
    process.env.MICROCMS_API_KEY = 'test-secret-api-key-12345';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Proxy: Preview route authorization and headers', () => {
    it('returns 404 when MICROCMS_PREVIEW_ENABLED is false or unset', async () => {
      process.env.MICROCMS_PREVIEW_ENABLED = 'false';
      const req = new NextRequest('https://osakafringe.com/preview/performances/test-id?draftKey=key123');
      const res = await proxy(req);

      assert.equal(res.status, 404);
      assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
    });

    it('returns 404 when MICROCMS_PREVIEW_ENABLED is empty', async () => {
      delete process.env.MICROCMS_PREVIEW_ENABLED;
      const req = new NextRequest('https://osakafringe.com/preview/performances/test-id?draftKey=key123');
      const res = await proxy(req);

      assert.equal(res.status, 404);
    });

    it('returns 503 configuration error when TEST_SITE_AUTH_SECRET is missing (no fallback to default secret)', async () => {
      delete process.env.TEST_SITE_AUTH_SECRET;
      const req = new NextRequest('https://osakafringe.com/preview/performances/test-id?draftKey=key123');
      const res = await proxy(req);

      assert.equal(res.status, 503);
      const text = await res.text();
      assert.ok(text.includes('Preview configuration error'));
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
    });

    it('allows general public to access normal pages without auth when TEST_SITE_PROTECTION_ENABLED is false', async () => {
      const req = new NextRequest('https://osakafringe.com/performances/test-id');
      const res = await proxy(req);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('X-Robots-Tag'), null);
    });

    it('redirects unauthenticated user from /preview to /password with returnUrl preserving draftKey', async () => {
      const req = new NextRequest(
        'https://osakafringe.com/preview/performances/content-99?draftKey=secretDraftKey777'
      );
      const res = await proxy(req);

      assert.equal(res.status, 307);
      const location = res.headers.get('location');
      assert.ok(location?.includes('/password'));
      assert.ok(location?.includes('returnUrl=%2Fpreview%2Fperformances%2Fcontent-99%3FdraftKey%3DsecretDraftKey777'));
      assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
    });

    it('blocks static file bypass attempt on preview route and redirects to /password', async () => {
      const req = new NextRequest('https://osakafringe.com/preview/performances/image.png');
      const res = await proxy(req);

      assert.equal(res.status, 307);
      const location = res.headers.get('location');
      assert.ok(location?.includes('/password'));
    });

    it('allows authenticated preview request and sets strict security and cache headers', async () => {
      const validToken = await generateAuthToken(process.env.TEST_SITE_AUTH_SECRET!);
      const req = new NextRequest(
        'https://osakafringe.com/preview/performances/content-99?draftKey=secretDraftKey777',
        {
          headers: {
            cookie: `${COOKIE_NAME}=${validToken}`,
          },
        }
      );
      const res = await proxy(req);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
      assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
    });

    it('sets Referrer-Policy: no-referrer on /password and /logout whitelist routes', async () => {
      const req = new NextRequest('https://osakafringe.com/password');
      const res = await proxy(req);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
      assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
    });
  });

  describe('Server Authentication Helper (isServerPreviewAuthenticated)', () => {
    it('returns true for valid signed session cookie with matching secret', async () => {
      const token = await generateAuthToken(process.env.TEST_SITE_AUTH_SECRET!);
      const isValid = await isServerPreviewAuthenticated(token);
      assert.equal(isValid, true);
    });

    it('returns false for tampered or invalid token', async () => {
      const isValid = await isServerPreviewAuthenticated('invalid.token-here');
      assert.equal(isValid, false);
    });

    it('returns false when MICROCMS_PREVIEW_ENABLED is false', async () => {
      process.env.MICROCMS_PREVIEW_ENABLED = 'false';
      const token = await generateAuthToken(process.env.TEST_SITE_AUTH_SECRET!);
      const isValid = await isServerPreviewAuthenticated(token);
      assert.equal(isValid, false);
    });

    it('returns false when TEST_SITE_AUTH_SECRET is empty', async () => {
      const token = await generateAuthToken(process.env.TEST_SITE_AUTH_SECRET!);
      delete process.env.TEST_SITE_AUTH_SECRET;
      const isValid = await isServerPreviewAuthenticated(token);
      assert.equal(isValid, false);
    });
  });

  describe('Password Verification Route (verify-password/route.ts)', () => {
    it('rejects authentication with 500 configuration error if returnUrl is preview and TEST_SITE_AUTH_SECRET is missing', async () => {
      delete process.env.TEST_SITE_AUTH_SECRET;
      const req = new Request('https://osakafringe.com/api/auth/verify-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.4' },
        body: JSON.stringify({
          password: 'fringe-preview-password-2026',
          returnUrl: '/preview/performances/content-1?draftKey=key',
        }),
      });

      const res = await verifyPasswordPost(req);
      assert.equal(res.status, 500);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.message.includes('設定が完了していません'));
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
    });

    it('authenticates and retains safe relative returnUrl with draftKey', async () => {
      const req = new Request('https://osakafringe.com/api/auth/verify-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.9' },
        body: JSON.stringify({
          password: 'fringe-preview-password-2026',
          returnUrl: '/preview/performances/content-1?draftKey=secret-key',
        }),
      });

      const res = await verifyPasswordPost(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.returnUrl, '/preview/performances/content-1?draftKey=secret-key');
      assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
    });
  });

  describe('Analytics Exclusion (shouldBlockAnalytics)', () => {
    it('blocks analytics on preview root and subpaths', () => {
      assert.equal(shouldBlockAnalytics('/preview'), true);
      assert.equal(shouldBlockAnalytics('/preview/performances/xyz'), true);
      assert.equal(shouldBlockAnalytics('/preview/performances/xyz?draftKey=key123'), true);
      assert.equal(
        shouldBlockAnalytics('https://osakafringe.com/preview/performances/xyz?draftKey=abc'),
        true
      );
    });

    it('blocks analytics on password auth page', () => {
      assert.equal(shouldBlockAnalytics('/password'), true);
      assert.equal(shouldBlockAnalytics('/password?returnUrl=%2Fpreview'), true);
      assert.equal(shouldBlockAnalytics('https://osakafringe.com/password'), true);
    });

    it('allows analytics on normal public pages', () => {
      assert.equal(shouldBlockAnalytics('/'), false);
      assert.equal(shouldBlockAnalytics('/audience'), false);
      assert.equal(shouldBlockAnalytics('/performances/00oebktvr'), false);
      assert.equal(shouldBlockAnalytics('/venues'), false);
      assert.equal(shouldBlockAnalytics('https://osakafringe.com/performances/00oebktvr'), false);
    });
  });

  describe('Draft Performance Fetching (getDraftPerformanceById)', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('throws DRAFT_KEY_MISSING error when draftKey is empty or missing', async () => {
      await assert.rejects(
        async () => {
          await getDraftPerformanceById('p1', '');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'DRAFT_KEY_MISSING');
          assert.ok(err.message.includes('下書きキー（draftKey）が指定されていません'));
          return true;
        }
      );
    });

    it('handles 404 not found from microCMS securely without leaking secrets', async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: 'Not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      };

      await assert.rejects(
        async () => {
          await getDraftPerformanceById('non-existent-id', 'draftKey123');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'NOT_FOUND');
          // Ensure secret API key or draftKey are NOT in error message
          assert.ok(!err.message.includes('test-secret-api-key-12345'));
          assert.ok(!err.message.includes('draftKey123'));
          return true;
        }
      );
    });

    it('handles 401 invalid draftKey from microCMS securely', async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: 'Invalid draftKey' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      };

      await assert.rejects(
        async () => {
          await getDraftPerformanceById('p1', 'expiredDraftKey');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'INVALID_DRAFT_KEY');
          assert.ok(err.message.includes('下書きキーが無効または期限切れです'));
          assert.ok(!err.message.includes('expiredDraftKey'));
          assert.ok(!err.message.includes('test-secret-api-key-12345'));
          return true;
        }
      );
    });

    it('handles network failure securely', async () => {
      globalThis.fetch = async () => {
        throw new Error('Network socket disconnected');
      };

      await assert.rejects(
        async () => {
          await getDraftPerformanceById('p1', 'draftKey123');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'NETWORK_ERROR');
          assert.ok(!err.message.includes('draftKey123'));
          assert.ok(!err.message.includes('test-secret-api-key-12345'));
          return true;
        }
      );
    });

    it('fetches draft data and normalizes into full Performance model with no-store', async () => {
      let capturedUrl = '';
      let capturedInit: RequestInit | undefined;

      globalThis.fetch = async (input, init) => {
        capturedUrl = String(input);
        capturedInit = init;

        // Mock microCMS response for performance detail
        return new Response(
          JSON.stringify({
            id: 'draft-p1',
            title: '下書き新作公演タイトル',
            titleEn: 'Draft New Performance Title',
            description: '下書き説明文',
            descriptionEn: 'Draft Description EN',
            artistName: 'テスト劇団',
            venueName: 'テスト会場',
            ticketPrice: '2,500円',
            ticketUrl: 'https://example.com/tickets',
            dates: [
              {
                date: '2026-10-03',
                startTime: '14:00',
                endTime: '15:30',
              },
            ],
            image: {
              url: 'https://images.microcms-assets.io/draft-hero.jpg',
            },
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        );
      };

      const result = await getDraftPerformanceById('draft-p1', 'validKey999');

      assert.ok(capturedUrl.includes('draftKey=validKey999'));
      assert.equal(capturedInit?.cache, 'no-store');
      assert.equal(capturedInit?.headers && (capturedInit.headers as Record<string, string>)['X-MICROCMS-API-KEY'], 'test-secret-api-key-12345');

      assert.equal(result.id, 'draft-p1');
      assert.equal(result.title, '下書き新作公演タイトル');
      assert.equal(result.titleEn, 'Draft New Performance Title');
      assert.equal(result.ticketPrice, '2,500円');
      assert.equal(result.ticketUrl, 'https://example.com/tickets');
      assert.equal(result.image, 'https://images.microcms-assets.io/draft-hero.jpg');
      assert.equal(result.schedules.length, 1);
      assert.equal(result.schedules[0].date, '2026-10-03');
    });
  });
});
