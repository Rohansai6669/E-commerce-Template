'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { getStoreModeClient, type StoreMode } from '@/core/config/store-mode';
import { setStoreModeAction } from '@/app/actions/set-store-mode';
import { Store, Users, ShieldCheck, Zap, Camera, Sliders, CreditCard } from 'lucide-react';
import { InstagramSettingsForm } from './instagram-settings';
import { RazorpaySettingsPanel } from './payment-settings';

/**
 * Settings Form panel for managing storefront configurations & operating mode.
 */
export function SettingsForm() {
  const [activeCategory, setActiveCategory] = React.useState<'general' | 'instagram' | 'payment'>('general');
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
        toast.success(`Store settings saved. Operating mode set to ${storeMode === 'marketplace' ? 'Multi-Vendor Marketplace' : 'Standalone E-Commerce'}.`);
        window.location.reload();
      } else {
        toast.error(res.error || 'Failed to update store mode.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl text-slate-900 py-2">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveCategory('general')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'general'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          General Store Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('instagram')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'instagram'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Camera className="h-4 w-4" />
          Instagram & Showcase Posts
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('payment')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'payment'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Payment Gateway (Razorpay)
        </button>
      </div>

      {activeCategory === 'instagram' ? (
        <InstagramSettingsForm />
      ) : activeCategory === 'payment' ? (
        <RazorpaySettingsPanel />
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-2xl">
          {/* Operating Mode Section */}
          <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider select-none flex items-center gap-2 font-heading">
                <Zap className="h-4 w-4 text-primary" />
                Store Architecture & Operating Mode
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Choose whether this platform operates as a direct single-merchant store or a multi-vendor marketplace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Standalone Option */}
              <label
                className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  storeMode === 'standalone'
                    ? 'border-primary bg-white ring-2 ring-primary/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:border-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className={`h-5 w-5 ${storeMode === 'standalone' ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-900">Standalone E-Commerce</span>
                  </div>
                  <input
                    type="radio"
                    name="storeMode"
                    value="standalone"
                    checked={storeMode === 'standalone'}
                    onChange={() => setStoreMode('standalone')}
                    className="h-4 w-4 text-primary accent-primary cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Single-merchant direct fulfillment. Direct central inventory management, streamlined checkout, and standard admin controls. Hides multi-supplier management.
                </p>
              </label>

              {/* Marketplace Option */}
              <label
                className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  storeMode === 'marketplace'
                    ? 'border-primary bg-white ring-2 ring-primary/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:border-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className={`h-5 w-5 ${storeMode === 'marketplace' ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-900">Multi-Vendor Marketplace</span>
                  </div>
                  <input
                    type="radio"
                    name="storeMode"
                    value="marketplace"
                    checked={storeMode === 'marketplace'}
                    onChange={() => setStoreMode('marketplace')}
                    className="h-4 w-4 text-primary accent-primary cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Multi-vendor platform. Supplier onboarding, multi-supplier inventory scoring, consignment routing, supplier portals, and marketplace commission ledgers.
                </p>
              </label>
            </div>
          </div>

          {/* General Storefront Settings */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 cursor-pointer h-10 font-semibold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white h-10"
              />
              <span className="text-xs text-slate-450 font-sans">
                Warn admin users on dashboard when items drop below this stock quantity.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                Default Design Theme
              </label>
              <div className="flex gap-4">
                {['light', 'dark', 'system'].map((t) => (
                  <label
                    key={t}
                    className={`flex-1 flex items-center justify-center p-3 rounded border text-xs font-bold capitalize cursor-pointer transition-all duration-200 ${
                      defaultTheme === t
                        ? 'border-slate-950 bg-slate-50 text-slate-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={t}
                      checked={defaultTheme === t}
                      onChange={() => setDefaultTheme(t)}
                      className="sr-only"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-2 h-11 bg-slate-950 text-white hover:bg-slate-900 font-bold uppercase text-xs rounded-lg cursor-pointer select-none transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving Configuration...' : 'Save Store Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
export default SettingsForm;
