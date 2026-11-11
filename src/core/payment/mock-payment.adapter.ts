import { type PaymentAdapter, type PaymentParams, type PaymentResult } from './payment.adapter';
import { logger } from '../logger';

/**
 * Mock payment adapter for development and testing environments.
 * Simulates processing latency and returns successful mock transactions.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  private readonly delayMs: number;

  constructor(delayMs = 1000) {
    this.delayMs = delayMs;
  }

  async processPayment(params: PaymentParams): Promise<PaymentResult> {
    logger.info(`[MOCK PAYMENT] Processing order ${params.orderId} for ${params.currency} ${params.amount}`);
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    const txId = `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (params.paymentType === 'cod') {
      return {
        success: true,
        transactionId: txId,
        provider: 'mock_cod',
      };
    }

    return {
      success: true,
      transactionId: txId,
      provider: 'mock_card',
    };
  }
}

export const mockPaymentAdapter = new MockPaymentAdapter();
export default mockPaymentAdapter;
