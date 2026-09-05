import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, donorName, donorEmail, donorMessage, locale } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 500) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum donation is 500 JPY.' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    const stripe = getStripe();

    const isEn = locale === 'en';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: isEn ? 'en' : 'ja',
      customer_email: donorEmail && donorEmail.trim() ? donorEmail.trim() : undefined,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: isEn
                ? 'Osaka Fringe Festival 2026 - Donation & Support'
                : '大阪フリンジフェスティバル2026 応援寄付',
              description: isEn
                ? 'Empowering emerging artists and street performing arts across Osaka.'
                : '若手アーティスト支援・多言語環境整備・フェスティバル運営支援へのご寄付',
              images: [
                `${origin}/images/osakafringe_visuals.webp`
              ],
            },
            unit_amount: Math.round(parsedAmount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        donorName: (donorName || '').slice(0, 500),
        donorMessage: (donorMessage || '').slice(0, 500),
      },
      payment_intent_data: {
        receipt_email: donorEmail && donorEmail.trim() ? donorEmail.trim() : undefined,
        metadata: {
          donorName: (donorName || '').slice(0, 500),
          donorMessage: (donorMessage || '').slice(0, 500),
        },
      },
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Stripe checkout session' },
      { status: 500 }
    );
  }
}
