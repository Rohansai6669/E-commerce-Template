import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { ThemeVariableProvider } from "@/providers/ThemeVariableProvider";
import { CartProvider } from "@/components/commerce/cart-context";
import { NetworkStatusIndicator } from "@/components/common/network-status-indicator";
import { ToastProvider } from "@/providers/ToastProvider";
import * as React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce Platform",
  description: "Production-ready custom e-commerce storefront template",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeVariableProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
