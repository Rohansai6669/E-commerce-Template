import * as React from 'react';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { eq, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { OrderConfirmation } from '@/components/storefront/checkout/order-confirmation';
import { type PlacedOrder } from '@/core/order/order.types';

export const metadata = {
  title: 'Order Confirmed | Lexido',
  description: 'Your order has been placed successfully.',
};

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = await params;
  const orderRow = await db.query.orders.findFirst({
    where: or(eq(orders.id, id), eq(orders.orderNumber, id)),
    with: {
      items: true,
      shippingMethod: true,
    },
  });

  if (!orderRow) {
    notFound();
  }

  const placedOrder: PlacedOrder = {
    id: orderRow.id,
    orderNumber: orderRow.orderNumber || id,
    status: orderRow.status,
    placedAt: orderRow.createdAt.toISOString(),
    estimatedDelivery: new Date(orderRow.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: (orderRow.items || []).map((i) => ({
      key: `${i.productId}:${i.variantId || 'default'}`,
      productId: i.productId || '',
      variantId: i.variantId,
      name: i.name,
      slug: '',
      imageUrl: i.imageUrl,
      price: parseFloat(i.price),
      options: {},
      quantity: i.quantity,
      stockLimit: 999,
    })),
    address: orderRow.shippingAddress as any,
    shippingMethod: orderRow.shippingMethod
      ? {
          id: orderRow.shippingMethod.id,
          name: orderRow.shippingMethod.name,
          price: parseFloat(orderRow.shippingMethod.price),
          carrier: 'Standard',
          description: orderRow.shippingMethod.estimatedDelivery || '',
          estimatedDays: 5,
        }
      : {
          id: 'standard',
          name: 'Standard Delivery',
          price: parseFloat(orderRow.shippingAmount || '0'),
          carrier: 'Standard',
          description: 'Delivered in 3-5 business days',
          estimatedDays: 5,
        },
    paymentMethod: { type: 'card' },
    couponCode: null,
    orderNotes: '',
    subtotal: parseFloat(orderRow.subtotal),
    discount: parseFloat(orderRow.discountAmount || '0'),
    shipping: parseFloat(orderRow.shippingAmount || '0'),
    tax: parseFloat(orderRow.taxAmount || '0'),
    total: parseFloat(orderRow.totalAmount),
  };

  return (
    <Container className="py-12 max-w-3xl mx-auto">
      <OrderConfirmation order={placedOrder} />
    </Container>
  );
}
