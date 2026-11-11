import * as React from 'react';
import Script from 'next/script';
import { connection } from 'next/server';
import { getCurrentUser, getCurrentProfile } from '@/core/auth/session';
import { addressRepository } from '@/core/address/address.repository';
import { CheckoutPageContent } from '@/components/storefront/checkout/checkout-page-content';

export const metadata = {
  title: 'Checkout | Storefront',
  description: 'Complete your purchase with secure checkout. Enter your shipping address, choose a delivery method, and place your order.',
};

/**
 * Server Component serving the /checkout page route.
 * Resolves authenticated customer profile and saved addresses for seamless checkout sync.
 */
export default async function CheckoutPage() {
  await connection();
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const addresses = user ? await addressRepository.getAddresses(user.id) : [];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <React.Suspense fallback={null}>
        <CheckoutPageContent
          user={user ? { id: user.id, email: user.email || '' } : null}
          initialProfile={
            profile
              ? {
                  fullName: profile.fullName || profile.name || '',
                  phone: profile.phone || '',
                }
              : null
          }
          initialAddresses={addresses}
        />
      </React.Suspense>
    </>
  );
}
