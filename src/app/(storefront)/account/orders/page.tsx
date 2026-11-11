import * as React from 'react';
import { getCurrentUser } from '@/core/auth/session';
import { orderRepository } from '@/core/order/order.repository';
import { OrdersList } from '@/components/storefront/account/orders-list';
import { redirect } from 'next/navigation';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { connection } from 'next/server';

export const metadata = {
  title: 'My Orders History | Storefront',
  description: 'Manage and review prior transactions and order histories.',
};

/**
 * Server Component serving the /account/orders history log page.
 */
export default async function AccountOrdersPage() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const orders = await orderRepository.getOrdersByProfileId(user.id);

  return (
    <Stack gap="5" className="w-full">
      <div>
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Order History
        </Heading>
        <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
          Track status updates and view details of prior orders.
        </Text>
      </div>

      <OrdersList orders={orders} />
    </Stack>
  );
}
