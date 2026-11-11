import * as React from 'react';
import Script from 'next/script';
import { CheckoutPageContent } from '@/components/storefront/checkout/checkout-page-content';

export const metadata = {
  title: 'Checkout | Storefront',
  description: 'Complete your purchase with secure checkout. Enter your shipping address, choose a delivery method, and place your order.',
};

/**
 * Server Component serving the /checkout page route.
 */
export default function CheckoutPage() {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <React.Suspense fallback={null}>
        <CheckoutPageContent />
      </React.Suspense>
    </>
  );
}
