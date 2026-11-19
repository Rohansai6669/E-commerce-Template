'use client';

import * as React from 'react';
import { AuthView } from '@/components/storefront/auth/auth-view';

/**
 * Storefront Luxury Authentication Page (Sign In / Options).
 * Conforms to minimal editorial luxury aesthetics.
 */
export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <AuthView initialMode="options" initialTab="login" />
    </React.Suspense>
  );
}
