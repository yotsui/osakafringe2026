/**
 * テストサイト全体パスワード保護用の暗号化・署名ユーティリティ
 * Web Crypto API（crypto.subtle）に準拠し、Next.js Edge Runtime / Node.js 双方で動作します。
 */

const COOKIE_NAME = 'test_site_session';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60; // 7日間（604,800秒）
const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000;

export interface SessionPayload {
  authenticated: true;
  issuedAt: number;
  expiresAt: number;
}

/**
 * 文字列をBase64URL文字列へエンコード
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL文字列をデコード
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * ArrayBufferをHex文字列に変換
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * タイミング攻撃耐性を持つバイト配列比較（定数時間比較）
 */
export function timingSafeEqualBuffers(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

/**
 * SHA-256ハッシュを計算しUint8Arrayで返却
 */
export async function sha256Digest(message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * タイミング攻撃耐性を持つパスワード照合
 * 互いにSHA-256ハッシュ（32バイト固定長）を算出し、定数時間で比較します。
 */
export async function verifyPasswordTimingSafe(input: string, expected: string): Promise<boolean> {
  if (typeof input !== 'string' || typeof expected !== 'string') {
    return false;
  }
  if (!input || !expected) {
    return false;
  }

  const [inputHash, expectedHash] = await Promise.all([
    sha256Digest(input),
    sha256Digest(expected),
  ]);

  return timingSafeEqualBuffers(inputHash, expectedHash);
}

/**
 * HMAC-SHA256 署名を生成
 */
export async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret || 'default-secret-fallback');
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return bufferToHex(signature);
}

/**
 * 署名付き認証セッショントークンを生成
 */
export async function generateAuthToken(secret: string): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    authenticated: true,
    issuedAt: now,
    expiresAt: now + SEVEN_DAYS_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = await createHmacSignature(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

/**
 * 署名付き認証セッショントークンを検証
 */
export async function verifyAuthToken(token: string | null | undefined, secret: string): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) {
    return false;
  }

  try {
    // 1. 署名の検証（定数時間比較）
    const expectedSignature = await createHmacSignature(encodedPayload, secret);
    const encoder = new TextEncoder();
    const isSignatureValid = timingSafeEqualBuffers(
      encoder.encode(providedSignature),
      encoder.encode(expectedSignature)
    );

    if (!isSignatureValid) {
      return false;
    }

    // 2. ペイロードの検証
    const decodedStr = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(decodedStr);

    if (!payload || payload.authenticated !== true) {
      return false;
    }

    // 3. 有効期限（7日間）の確認
    const now = Date.now();
    if (typeof payload.expiresAt !== 'number' || now >= payload.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * オープンリダイレクトを防ぐための戻り先URL検証・サニタイズ
 * - 先頭が '/' で始まるサイト内相対パスのみ許可
 * - '//' や '/\' などプロトコル相対URLやエスケープシーケンスを拒否
 * - プロトコル指定（http:, https:, javascript:, data:等）を拒否
 */
export function getSafeReturnUrl(returnUrl?: string | null): string {
  if (!returnUrl || typeof returnUrl !== 'string') {
    return '/';
  }

  const trimmed = returnUrl.trim();

  // 1. '/' から始まる相対パスであることを確認
  if (!trimmed.startsWith('/')) {
    return '/';
  }

  // 2. '//' や '/\' で始まるプロトコル相対URLまたはパス・トラバーサルを拒否
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return '/';
  }

  // 3. 認証・ログイン・パスワード画面へのループリダイレクトを防止
  if (trimmed.startsWith('/password') || trimmed.startsWith('/api/auth/')) {
    return '/';
  }

  // 4. URLパースによりスキームが混入していないか確認
  try {
    // 相対URLをダミーオリジンと結合してパース
    const parsed = new URL(trimmed, 'https://osakafringe.local');
    if (parsed.origin !== 'https://osakafringe.local') {
      return '/';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

export { COOKIE_NAME, SEVEN_DAYS_SECONDS };
