import Razorpay from 'razorpay';
import crypto from 'crypto';
import { type PaymentAdapter, type PaymentParams, type PaymentResult } from './payment.adapter';
import { logger } from '../logger';

/**
 * Razorpay Payment Gateway Adapter.
 * Handles order creation, modal checkout signature verification, and webhook validation.
 */
export class RazorpayAdapter implements PaymentAdapter {
  private razorpay: Razorpay | null = null;
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId =
      process.env.RAZORPAY_KEY ||
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      '';
    this.keySecret = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

    if (this.keyId && this.keySecret) {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } else {
      logger.warn('[RAZORPAY ADAPTER] Missing RAZORPAY_KEY or RAZORPAY_SECRET in environment.');
    }
  }

  getKeyId(): string {
    return this.keyId;
  }

  isConfigured(): boolean {
    return Boolean(this.razorpay && this.keyId && this.keySecret);
  }

  /**
   * Creates a Razorpay Order before opening client checkout modal.
   * Amount must be passed in standard currency units (e.g. INR 500) and is converted to paise.
   */
  async createOrder(params: {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    if (!this.razorpay) {
      throw new Error(
        'Razorpay is not configured. Please set RAZORPAY_KEY and RAZORPAY_SECRET in environment.'
      );
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(params.amount * 100);

    const rzpOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    });

    return {
      id: rzpOrder.id,
      amount: rzpOrder.amount as number,
      currency: rzpOrder.currency as string,
    };
  }

  /**
   * Verifies the cryptographic HMAC SHA256 payment signature returned by the Razorpay checkout modal.
   */
  verifySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    if (!this.keySecret) {
      logger.error('[RAZORPAY ADAPTER] Cannot verify signature: missing RAZORPAY_SECRET');
      return false;
    }

    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === params.razorpaySignature;
  }

  /**
   * Verifies webhook signature sent in x-razorpay-signature header.
   */
  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
    try {
      return Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
    } catch (err) {
      logger.error('[RAZORPAY ADAPTER] Webhook signature validation error', { error: err });
      return false;
    }
  }

  /**
   * Fetches payment details from Razorpay API.
   */
  async fetchPayment(paymentId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured.');
    }
    return this.razorpay.payments.fetch(paymentId);
  }

  /**
   * Processes payment — supports COD directly, or verifies Razorpay signature for online payments.
   */
  async processPayment(params: PaymentParams): Promise<PaymentResult> {
    if (params.paymentType === 'cod') {
      return {
        success: true,
        transactionId: `cod_${Date.now()}_${params.orderId.slice(0, 6)}`,
        provider: 'cod',
      };
    }

    if (params.paymentType === 'razorpay' || params.paymentType === 'card') {
      // If signature is provided, verify it directly
      if (params.razorpayOrderId && params.razorpayPaymentId && params.razorpaySignature) {
        const isValid = this.verifySignature({
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        });

        if (!isValid) {
          logger.error(`[RAZORPAY ADAPTER] Invalid payment signature for order ${params.orderId}`);
          return {
            success: false,
            transactionId: params.razorpayPaymentId,
            provider: 'razorpay',
            error: 'Payment verification failed: invalid signature.',
          };
        }

        return {
          success: true,
          transactionId: params.razorpayPaymentId,
          provider: 'razorpay',
        };
      }

      return {
        success: false,
        transactionId: null,
        provider: 'razorpay',
        error: 'Razorpay order requires client checkout completion and signature verification.',
      };
    }

    return {
      success: false,
      transactionId: null,
      provider: 'unknown',
      error: `Unsupported payment type: ${params.paymentType}`,
    };
  }
}

export const razorpayAdapter = new RazorpayAdapter();

