import { getStripe } from '@/lib/stripe';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { validateDonateInput, getVerifiedOrigin } from '@/lib/apiValidators';

const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 10 requests per minute per IP
};

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`donate-checkout:${clientIp}`, RATE_LIMIT_CONFIG);
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

    const validation = validateDonateInput(body);
    if (!validation.valid || !validation.data) {
      return Response.json(
        { error: validation.error || 'Invalid donation payload' },
        { status: 400 }
      );
    }

    const { amount, donorName, donorEmail, donorMessage, isEn } = validation.data;

    // 3. Safe verified origin
    const origin = getVerifiedOrigin();

    // 7. Stripe Checkout Session creation
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: isEn ? 'en' : 'ja',
      customer_email: donorEmail,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: isEn
                ? 'Osaka Fringe 2026 - Donation & Support'
                : '大阪文化万博Osaka Fringe 2026 応援寄付',
              description: isEn
                ? 'Empowering emerging artists and street performing arts across Osaka.'
                : '若手アーティスト支援・多言語環境整備・フェスティバル運営支援へのご寄付',
              images: [
                `${origin}/images/osakafringe_visuals.webp`,
              ],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        donorName,
        donorMessage,
      },
      payment_intent_data: {
        receipt_email: donorEmail,
        metadata: {
          donorName,
          donorMessage,
        },
      },
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error('[Stripe Checkout Error]', error);
    return Response.json(
      { error: 'Payment system is temporarily unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}
