import * as React from 'react';
import { getCurrentUser } from '@/core/auth/session';
import { orderRepository } from '@/core/order/order.repository';
import { OrderDetailView } from '@/components/storefront/account/order-detail-view';
import { redirect, notFound } from 'next/navigation';
import { connection } from 'next/server';

export const metadata = {
  title: 'Order Status Detail | Storefront',
  description: 'Track and trace full delivery updates and payment states logs.',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component hosting the detailed single Order summary viewer.
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await connection();
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const { id } = resolvedParams;
  const order = await orderRepository.getOrderDetailById(id, user.id);

  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
