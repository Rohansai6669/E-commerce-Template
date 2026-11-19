'use client';

import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import 'sonner/dist/styles.css';

/**
 * Global Luxury E-Commerce Toast Provider
 * Replaces intrusive popups and unstyled alert boxes with
 * refined, floating, modern luxury pill toast notifications.
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      offset={24}
      gap={8}
      visibleToasts={3}
      duration={2600}
      closeButton={false}
      theme="dark"
      toastOptions={{
        unstyled: false,
        className: 'lexido-luxury-toast',
      }}
    />
  );
}

export default ToastProvider;
