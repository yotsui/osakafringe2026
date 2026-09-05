import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables.');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      appInfo: {
        name: 'Osaka Fringe Festival 2026',
        version: '1.0.0',
      },
    });
  }
  return stripeInstance;
}
