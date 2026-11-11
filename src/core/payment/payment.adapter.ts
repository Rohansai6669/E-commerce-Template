/**
 * Parameters passed to a payment adapter for processing.
 */
export interface PaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  paymentType: 'card' | 'cod' | 'razorpay';
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  metadata?: Record<string, string>;
}

/**
 * Result returned from payment processing.
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  provider: string;
  error?: string;
}

/**
 * PaymentAdapter interface — implement for each payment provider.
 *
 * Implementations:
 * - RazorpayAdapter
 * - StripeAdapter
 */
export interface PaymentAdapter {
  processPayment(params: PaymentParams): Promise<PaymentResult>;
}
