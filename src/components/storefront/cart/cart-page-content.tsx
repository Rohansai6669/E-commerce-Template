'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/commerce/cart-context';
import { CartItemRow } from './cart-item-row';
import { CartSummaryComponent } from './cart-summary';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { LoadingCard } from '@/components/feedback/loading-card';

/**
 * Coordination wrapper serving the full cart review workflow.
 */
export function CartPageContent() {
  const {
    items,
    summary,
    coupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <Container className="py-12">
        <LoadingCard />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 max-w-xl text-center">
        <EmptyState
          title="Your shopping cart is empty"
          description="It looks like you haven't added any products to your cart yet. Explore our collections to get started."
          icon="ShoppingBag"
        >
          <Button asChild className="mt-4 font-semibold text-xs cursor-pointer">
            <Link href="/products">Browse Products</Link>
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Stack gap="8">
        <div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Shopping Cart
          </Heading>
          <Text className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Review your items and proceed to checkout.
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Items lists */}
          <div className="lg:col-span-8 border border-border px-5 py-2 bg-card rounded-md shadow-sm w-full divide-y divide-border">
            {items.map((item) => (
              <CartItemRow
                key={item.key}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>

          {/* Pricing calculations summary card */}
          <div className="lg:col-span-4 w-full">
            <CartSummaryComponent
              summary={summary}
              coupon={coupon}
              items={items}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
            />
          </div>
        </div>
      </Stack>
    </Container>
  );
}
export default CartPageContent;
