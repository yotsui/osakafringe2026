import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyPasswordTimingSafe,
  generateAuthToken,
  verifyAuthToken,
  getSafeReturnUrl,
  base64UrlEncode,
  base64UrlDecode,
} from '../src/lib/authCrypto.ts';

describe('Auth Crypto: base64Url', () => {
  it('encodes and decodes utf-8 strings correctly', () => {
    const original = 'OsakaFringe-2026-大阪フリンジ-$%#';
    const encoded = base64UrlEncode(original);
    assert.doesNotMatch(encoded, /[+/=]/);
    const decoded = base64UrlDecode(encoded);
    assert.equal(decoded, original);
  });
});

describe('Auth Crypto: verifyPasswordTimingSafe', () => {
  it('returns true when passwords match', async () => {
    const isMatch = await verifyPasswordTimingSafe('mySecretPass123!', 'mySecretPass123!');
    assert.equal(isMatch, true);
  });

  it('returns false when passwords differ', async () => {
    const isMatch = await verifyPasswordTimingSafe('wrongPassword', 'mySecretPass123!');
    assert.equal(isMatch, false);
  });

  it('returns false when input or expected is empty', async () => {
    assert.equal(await verifyPasswordTimingSafe('', 'mySecretPass123!'), false);
    assert.equal(await verifyPasswordTimingSafe('mySecretPass123!', ''), false);
  });
});

describe('Auth Crypto: generateAuthToken & verifyAuthToken', () => {
  const secret = 'super-test-secret-key-32-chars-minimum!';

  it('generates and verifies valid token', async () => {
    const token = await generateAuthToken(secret);
    assert.ok(token.includes('.'));
    const isValid = await verifyAuthToken(token, secret);
    assert.equal(isValid, true);
  });

  it('rejects token with wrong secret', async () => {
    const token = await generateAuthToken(secret);
    const isValid = await verifyAuthToken(token, 'another-secret-key-that-does-not-match');
    assert.equal(isValid, false);
  });

  it('rejects tampered token signature or payload', async () => {
    const token = await generateAuthToken(secret);
    const [payload, sig] = token.split('.');
    
    // Modify payload
    const tamperedPayload = payload + 'abc';
    assert.equal(await verifyAuthToken(`${tamperedPayload}.${sig}`, secret), false);

    // Modify signature
    const tamperedSig = sig.slice(0, -4) + '0000';
    assert.equal(await verifyAuthToken(`${payload}.${tamperedSig}`, secret), false);
  });

  it('rejects expired token', async () => {
    const expiredPayload = base64UrlEncode(
      JSON.stringify({
        authenticated: true,
        issuedAt: Date.now() - 100000000,
        expiresAt: Date.now() - 1000, // Expired in past
      })
    );
    const { createHmacSignature } = await import('../src/lib/authCrypto.ts');
    const sig = await createHmacSignature(expiredPayload, secret);
    const token = `${expiredPayload}.${sig}`;

    assert.equal(await verifyAuthToken(token, secret), false);
  });
});

describe('Auth Crypto: getSafeReturnUrl', () => {
  it('accepts valid internal relative paths', () => {
    assert.equal(getSafeReturnUrl('/performances/00oebktvr'), '/performances/00oebktvr');
    assert.equal(getSafeReturnUrl('/audience?tab=map#top'), '/audience?tab=map#top');
    assert.equal(getSafeReturnUrl('/about'), '/about');
  });

  it('rejects open redirect attacks and falls back to "/"', () => {
    assert.equal(getSafeReturnUrl('https://evil.com'), '/');
    assert.equal(getSafeReturnUrl('http://evil.com'), '/');
    assert.equal(getSafeReturnUrl('//evil.com/path'), '/');
    assert.equal(getSafeReturnUrl('/\\evil.com'), '/');
    assert.equal(getSafeReturnUrl('\\evil.com'), '/');
    assert.equal(getSafeReturnUrl('javascript:alert(1)'), '/');
    assert.equal(getSafeReturnUrl('data:text/html,<script>alert(1)</script>'), '/');
  });

  it('prevents loop redirect to login or auth routes', () => {
    assert.equal(getSafeReturnUrl('/password'), '/');
    assert.equal(getSafeReturnUrl('/password?returnUrl=/about'), '/');
    assert.equal(getSafeReturnUrl('/api/auth/verify-password'), '/');
  });

  it('handles null, undefined, or empty values', () => {
    assert.equal(getSafeReturnUrl(null), '/');
    assert.equal(getSafeReturnUrl(undefined), '/');
    assert.equal(getSafeReturnUrl(''), '/');
    assert.equal(getSafeReturnUrl('   '), '/');
  });
});
