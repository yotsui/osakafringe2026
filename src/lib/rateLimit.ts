/**
 * インメモリ・レートリミッター（軽量・外部依存なしのBest-Effort方式）
 * 
 * 注意：
 * 本実装はNode.js/Serverlessプロセスメモリ内で動作するベストエフォート型の制限です。
 * Vercelの複数インスタンス（Lambda）間ではメモリが共有されず、コールドスタート時にリセットされます。
 * 単一インスタンスに対する瞬間的な高頻度リクエストやブルートフォースの抑制として機能します。
 * インスタンス間を跨いだ完全な分散レート制限が必要な場合は、Vercel Firewall / WAF または
 * Upstash Redis（Vercel KV）等と連携する構成を推奨します。
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired rate limit entries (prevents memory leak)
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extract client IP from Request headers in Vercel / proxy environments.
 */
export function getClientIp(req: Request | { headers: Headers | { get(name: string): string | null } }): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
}

/**
 * Check and record a rate limit hit for a given key.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: Math.ceil(resetTime / 1000),
      retryAfterSeconds: 0,
    };
  }

  if (entry.count < config.maxRequests) {
    entry.count += 1;
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      reset: Math.ceil(entry.resetTime / 1000),
      retryAfterSeconds: 0,
    };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    reset: Math.ceil(entry.resetTime / 1000),
    retryAfterSeconds,
  };
}

/**
 * Helper to generate a 429 Too Many Requests response with standard headers.
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}

/**
 * Clear the internal rate limit store (useful for unit tests).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
  lastCleanup = Date.now();
}
