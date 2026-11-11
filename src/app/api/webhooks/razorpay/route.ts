import { NextRequest, NextResponse } from 'next/server';
import { razorpayAdapter } from '@/core/payment/razorpay.adapter';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { payments } from '@/lib/db/schema/payment';
import { eq } from 'drizzle-orm';
import { logger } from '@/core/logger';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = razorpayAdapter.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      logger.warn('[RAZORPAY WEBHOOK] Invalid signature detected.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    logger.info(`[RAZORPAY WEBHOOK] Received event: ${event.event}`);

    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = event.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayPaymentId) {
          // Update matching payment record
          const existingPayment = await db
            .select()
            .from(payments)
            .where(eq(payments.transactionId, razorpayPaymentId))
            .limit(1);

          if (existingPayment.length > 0) {
            await db
              .update(payments)
              .set({
                status: 'succeeded',
                capturedAt: new Date(),
                providerResponse: paymentEntity,
                updatedAt: new Date(),
              })
              .where(eq(payments.id, existingPayment[0].id));

            // Ensure order is marked processing
            await db
              .update(orders)
              .set({ status: 'processing', updatedAt: new Date() })
              .where(eq(orders.id, existingPayment[0].orderId));
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = event.payload?.payment?.entity;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayPaymentId) {
          await db
            .update(payments)
            .set({
              status: 'failed',
              providerResponse: paymentEntity,
              updatedAt: new Date(),
            })
            .where(eq(payments.transactionId, razorpayPaymentId));
        }
        break;
      }

      default:
        logger.info(`[RAZORPAY WEBHOOK] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    logger.error('[RAZORPAY WEBHOOK] Processing error', { error: err });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

