import * as React from 'react';
import { Header } from '@/components/navigation/Header/header';
import { Footer } from '@/components/navigation/Footer/footer';
import { Container } from '@/components/layout/container';
import { SupplierTabs } from '@/components/supplier/supplier-tabs';
import { getCurrentProfile } from '@/core/auth/session';
import { getStoreModeServer } from '@/core/config/store-mode.server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function SupplierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const [profile, storeMode] = await Promise.all([
    getCurrentProfile(),
    getStoreModeServer(),
  ]);

  if (!profile || (profile.role !== 'supplier' && profile.role !== 'admin' && profile.role !== 'staff')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-slate-900 font-sans">
      {/* Storefront Header Navigation bar */}
        <Header />

        {/* Main viewport canvas */}
        <main className="flex-1 w-full flex flex-col bg-white">
          <Container className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full flex flex-col">
            {/* Standalone E-Commerce Alert Banner */}
            {storeMode === 'standalone' && (
              <div className="mb-8 p-5 rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-amber-950 font-heading">
                      Standalone E-Commerce Mode Active (Marketplace Disabled)
                    </h4>
                    <p className="text-xs text-amber-900/90 leading-relaxed font-sans max-w-3xl">
                      The store is currently configured for single-merchant operation. Multi-vendor supplier onboarding, consignment routing, and supplier portal actions are inactive.
                    </p>
                  </div>
                </div>
                {profile.role === 'admin' && (
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950 text-amber-50 hover:bg-amber-900 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer select-none shadow-xs"
                  >
                    <Settings className="w-4 h-4" />
                    Configure in Settings
                  </Link>
                )}
              </div>
            )}

            {/* Section Breadcrumbs */}
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 select-none">
              Supplier Portal
            </span>

            {/* Large Wide Heading Title */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 uppercase mt-1 mb-6 font-heading">
              Boutique Control Center
            </h1>

            {/* Horizontal navigation tabs selector */}
            <SupplierTabs />

            {/* Renders dashboard content viewports */}
            <div className="flex-1 w-full text-slate-900">
              {children}
            </div>
          </Container>
        </main>

        {/* Storefront Footer bar */}
        <Footer />
      </div>
  );
}
