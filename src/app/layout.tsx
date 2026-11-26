import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { ThemeVariableProvider } from "@/providers/ThemeVariableProvider";
import { CartProvider } from "@/components/commerce/cart-context";
import { NetworkStatusIndicator } from "@/components/common/network-status-indicator";
import { ToastProvider } from "@/providers/ToastProvider";
import { getSiteDesignTokensServer } from "@/lib/cms/cms-server";
import * as React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "Ecommerce Platform",
  description: "Production-ready custom e-commerce storefront template",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTokens = await getSiteDesignTokensServer();
  const isDark = initialTokens?.themeMode === 'dark';
  const isSystem = initialTokens?.themeMode === 'system';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${isDark ? 'dark' : ''} h-full antialiased`}
      data-theme={isDark ? 'dark' : 'light'}
      style={{ colorScheme: isDark ? 'dark' : isSystem ? undefined : 'light' }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeVariableProvider initialTokens={initialTokens}>
          <SupabaseProvider>
            <CartProvider>
              <React.Suspense fallback={null}>
                {children}
              </React.Suspense>
              <NetworkStatusIndicator />
              <ToastProvider />
            </CartProvider>
          </SupabaseProvider>
        </ThemeVariableProvider>
      </body>
    </html>
  );
}
