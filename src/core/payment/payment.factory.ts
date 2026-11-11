import { type PaymentAdapter } from './payment.adapter';
import { MockPaymentAdapter } from './mock-payment.adapter';
import { RazorpayAdapter } from './razorpay.adapter';

/**
 * Returns the configured payment adapter instance.
 *
 * Configure via the PAYMENT_PROVIDER environment variable:
 * - 'razorpay' → RazorpayAdapter
 * - 'stripe'   → StripeAdapter
 * - 'mock' (default in dev if not set) → MockPaymentAdapter
 */
export function getPaymentAdapter(): PaymentAdapter {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();

  switch (provider) {
    case 'razorpay':
      return new RazorpayAdapter();

    case 'mock':
      return new MockPaymentAdapter();

    default:
      // If Razorpay keys exist in environment and no provider is specified, use Razorpay
      if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
        return new RazorpayAdapter();
      }
      return new MockPaymentAdapter();
  }
}
