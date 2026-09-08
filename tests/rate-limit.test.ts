import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, getClientIp, resetRateLimitStore } from '../src/lib/rateLimit.ts';

test('Rate Limiter: extracts IP correctly from standard and proxy headers', () => {
  const req1 = new Request('http://localhost/api/test', {
    headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
  });
  assert.equal(getClientIp(req1), '203.0.113.195');

  const req2 = new Request('http://localhost/api/test', {
    headers: { 'x-real-ip': '198.51.100.1' },
  });
  assert.equal(getClientIp(req2), '198.51.100.1');

  const req3 = new Request('http://localhost/api/test', {
    headers: { 'cf-connecting-ip': '192.0.2.1' },
  });
  assert.equal(getClientIp(req3), '192.0.2.1');

  const reqFallback = new Request('http://localhost/api/test');
  assert.equal(getClientIp(reqFallback), '127.0.0.1');
});

test('Rate Limiter: enforces max requests and calculates remaining correctly', () => {
  resetRateLimitStore();
  const testIp = `test-ip-${Date.now()}-${Math.random()}`;
  const config = { maxRequests: 3, windowMs: 10000 };

  const res1 = checkRateLimit(`custom:${testIp}`, config);
  assert.equal(res1.success, true);
  assert.equal(res1.remaining, 2);

  const res2 = checkRateLimit(`custom:${testIp}`, config);
  assert.equal(res2.success, true);
  assert.equal(res2.remaining, 1);

  const res3 = checkRateLimit(`custom:${testIp}`, config);
  assert.equal(res3.success, true);
  assert.equal(res3.remaining, 0);

  const res4 = checkRateLimit(`custom:${testIp}`, config);
  assert.equal(res4.success, false);
  assert.equal(res4.remaining, 0);
  assert.equal(res4.retryAfterSeconds > 0, true);
});
