import { translateWithGemini } from '@/lib/gemini';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { validateTranslateInput } from '@/lib/apiValidators';

const RATE_LIMIT_CONFIG = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 20 requests per minute per IP
};

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`translate:${clientIp}`, RATE_LIMIT_CONFIG);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    // 2. Parse & Validate JSON
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const validation = validateTranslateInput(body);
    if (!validation.valid || !validation.data) {
      return Response.json(
        { error: validation.error || 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { text, context } = validation.data;
    const translatedText = await translateWithGemini(text, context);

    return Response.json({ translation: translatedText });
  } catch (error: unknown) {
    console.error('Translation API route error:', error);
    return Response.json(
      { error: 'Translation service is temporarily unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}