'use client';

import * as React from 'react';
import { AuthView } from '@/components/storefront/auth/auth-view';

/**
 * Storefront Luxury Authentication Page (Register / Create Account).
 * Conforms to minimal editorial luxury aesthetics.
 */
export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <AuthView initialMode="email" initialTab="register" />
    </React.Suspense>
  );
}
