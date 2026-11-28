'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { getStoreModeClient, type StoreMode } from '@/core/config/store-mode';
import { setStoreModeAction } from '@/app/actions/set-store-mode';
import {
  Store,
  Users,
  ShieldCheck,
  Zap,
  Camera,
  Sliders,
  CreditCard,
  Truck,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { InstagramSettingsForm } from './instagram-settings';
import { RazorpaySettingsPanel } from './payment-settings';
import { ShippingSettingsPanel } from './shipping-settings';

type SettingsCategory = 'general' | 'shipping' | 'payment' | 'instagram';

interface TabItem {
  id: SettingsCategory;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  {
    id: 'general',
    label: 'General Store',
    subtitle: 'Architecture, currency & inventory',
    icon: Sliders,
  },
  {
    id: 'shipping',
    label: 'Shipping & Delivery',
    subtitle: 'Rates, free delivery & COD toggle',
    icon: Truck,
  },
  {
    id: 'payment',
    label: 'Payment Gateway',
    subtitle: 'Razorpay keys, UPI & webhooks',
    icon: CreditCard,
  },
  {
    id: 'instagram',
    label: 'Instagram Showcase',
    subtitle: 'Social media curation & feed',
    icon: Camera,
  },
];

/**
 * Settings Form panel for managing storefront configurations & operating mode.
 * Features an executive Master-Detail layout with a persistent sidebar and balanced responsive canvas.
 */
export function SettingsForm() {
  const [activeCategory, setActiveCategory] = React.useState<SettingsCategory>('general');
  const [storeName, setStoreName] = React.useState('Modern Storefront');
  const [currency, setCurrency] = React.useState('INR');
  const [lowStockThreshold, setLowStockThreshold] = React.useState(5);
  const [defaultTheme, setDefaultTheme] = React.useState('light');
  const [storeMode, setStoreMode] = React.useState<StoreMode>('standalone');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setStoreMode(getStoreModeClient());
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await setStoreModeAction(storeMode);
      if (res.success) {
        toast.success(
          `Store settings saved. Operating mode set to ${
            storeMode === 'marketplace' ? 'Multi-Vendor Marketplace' : 'Standalone E-Commerce'
          }.`
        );
        window.location.reload();
      } else {
        toast.error(res.error || 'Failed to update store mode.');
      }
    } catch {
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
      {/* 1. Left Sidebar Navigation Column (Sticky on Desktop) */}
      <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-5 lg:sticky lg:top-20">
        {/* Navigation Group Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs flex flex-col gap-1 w-full">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
            Settings Navigation
          </div>

          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`p-2 rounded-md shrink-0 ${
                        isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate leading-snug">{tab.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {tab.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick System Context Card */}
        <div className="hidden lg:flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Store Configuration</span>
          </div>
          <div className="space-y-2 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Mode:</span>
              <span className="font-semibold capitalize text-slate-900">
                {storeMode === 'marketplace' ? 'Multi-Vendor' : 'Direct Merchant'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Currency:</span>
              <span className="font-semibold text-slate-900 font-mono">{currency} (₹)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Right Main Viewport Column (Generous Full-Width Canvas) */}
      <main className="flex-1 min-w-0 w-full">
        {activeCategory === 'shipping' ? (
          <div className="w-full">
            <ShippingSettingsPanel />
          </div>
        ) : activeCategory === 'instagram' ? (
          <div className="w-full">
            <InstagramSettingsForm />
          </div>
        ) : activeCategory === 'payment' ? (
          <div className="w-full">
            <RazorpaySettingsPanel />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">
            {/* Top Section Header */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-950 font-heading">
                    General Store Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-sans">
                    Define fundamental store architecture, naming, operational currency, and inventory warning levels.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-xs uppercase tracking-wider px-5 h-10 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
              >
                {isSaving ? 'Saving Changes...' : 'Save Configuration'}
              </Button>
            </div>

            {/* 1. Operating Architecture Card */}
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <Heading
                  level={3}
                  className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
                >
                  Store Architecture &amp; Operating Mode
                </Heading>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-slate-500">
                  Select how this e-commerce deployment operates. Changes take effect across navigation, vendor routing, and order splitting.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Standalone Option */}
                  <label
                    className={`flex flex-col gap-3 p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      storeMode === 'standalone'
                        ? 'border-slate-950 bg-slate-50/60 ring-2 ring-slate-950/10 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            storeMode === 'standalone'
                              ? 'bg-slate-950 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Store className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Standalone E-Commerce
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="storeMode"
                        value="standalone"
                        checked={storeMode === 'standalone'}
                        onChange={() => setStoreMode('standalone')}
                        className="h-4 w-4 text-slate-950 accent-slate-950 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Single-merchant direct fulfillment. Direct inventory control, streamlined catalog editing, and centralized order dispatch. Hides external supplier portals.
                    </p>
                    <div className="mt-auto pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ideal for brands, boutiques &amp; D2C labels
                    </div>
                  </label>

                  {/* Marketplace Option */}
                  <label
                    className={`flex flex-col gap-3 p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      storeMode === 'marketplace'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            storeMode === 'marketplace'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Multi-Vendor Marketplace
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="storeMode"
                        value="marketplace"
                        checked={storeMode === 'marketplace'}
                        onChange={() => setStoreMode('marketplace')}
                        className="h-4 w-4 text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Multi-vendor platform. Automated supplier onboarding, supplier inventory scoring, consignment routing, merchant approval queues, and commission ledgers.
                    </p>
                    <div className="mt-auto pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ideal for multi-brand hubs &amp; aggregators
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* 2. Store Identity & Regional Localization Card */}
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <Heading
                  level={3}
                  className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
                >
                  Store Identity &amp; Localization
                </Heading>
              </CardHeader>

              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Store Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                      Storefront Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white h-10"
                      placeholder="e.g. Modern Storefront"
                    />
                    <p className="text-[11px] text-slate-400">
                      Public store identity shown in emails and meta headers.
                    </p>
                  </div>

                  {/* Default Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                      Default Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-950 cursor-pointer h-10"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Base currency used for catalog pricing and settlements.
                    </p>
                  </div>

                  {/* Low Stock Warning Threshold */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                      Low Stock Threshold (Units)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
                      className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white h-10 font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Triggers warning flags when inventory dips below this count.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Appearance Theme Card */}
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <Heading
                  level={3}
                  className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
                >
                  Appearance &amp; Color Mode
                </Heading>
              </CardHeader>

              <CardContent className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light Theme', icon: Sun },
                    { id: 'dark', label: 'Dark Theme', icon: Moon },
                    { id: 'system', label: 'System Default', icon: Laptop },
                  ].map((t) => {
                    const ThemeIcon = t.icon;
                    const isSelected = defaultTheme === t.id;
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-3 p-3.5 rounded-lg border text-xs font-bold capitalize cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'border-slate-950 bg-slate-50 text-slate-950 ring-1 ring-slate-950/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={t.id}
                          checked={isSelected}
                          onChange={() => setDefaultTheme(t.id)}
                          className="sr-only"
                        />
                        <ThemeIcon className="w-4 h-4 text-slate-500" />
                        <span>{t.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-slate-950 ml-auto" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save Action Footer Bar */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Review your changes and click save to apply configurations across the store.
              </div>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-xs uppercase tracking-wider px-6 h-10 cursor-pointer shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Store Settings'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default SettingsForm;
