import * as React from 'react';
import { CartPageContent } from '@/components/storefront/cart/cart-page-content';

export const metadata = {
  title: 'Shopping Cart | Storefront',
  description: 'Review your selected items, apply promotional codes, and proceed to checkout.',
};

/**
 * Server Component serving the /cart page route.
 */
export default function CartPage() {
  return (
    <React.Suspense fallback={null}>
      <CartPageContent />
    </React.Suspense>
  );
}
