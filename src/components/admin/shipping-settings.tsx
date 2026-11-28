'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Banknote,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Sliders,
  PackageCheck,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getLogisticsSettingsAction,
  updateLogisticsSettingsAction,
} from '@/app/actions/shipping-actions';
import { type LogisticsConfig } from '@/lib/shipping/logistics-manager';

export function ShippingSettingsPanel() {
  const [config, setConfig] = React.useState<LogisticsConfig>({
    enabled: true,
    activeProvider: 'shiprocket',
    dynamicPricing: true,
    defaultPickupPincode: '500060',
    fallbackFlatRate: 99,
    freeShippingThreshold: 2000,
    enableCod: true,
    enableGpsPreciseAddress: true,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load existing configuration on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getLogisticsSettingsAction();
        if (mounted && res.config) {
          setConfig(res.config);
        }
      } catch (err) {
        console.error('Failed to load logistics settings:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateLogisticsSettingsAction(config);
      if (res.success) {
        toast.success(
          'Shipping charges, free shipping threshold, and COD settings saved successfully!'
        );
      } else {
        toast.error(res.error || 'Failed to update shipping settings.');
      }
    } catch {
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
        <span className="text-xs font-semibold">Loading shipping &amp; delivery settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 w-full py-2">
      {/* Top Banner Status Header */}
      <div className="p-5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold uppercase tracking-tight font-heading">
                Shipping, Free Delivery &amp; COD Controls
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  config.enableCod
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {config.enableCod ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COD ACTIVE
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-400" /> COD DISABLED
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-sans">
              Control standard shipping fees, set minimum order values for free shipping, and toggle
              Cash on Delivery for checkout.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider px-5 h-10 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Pricing & COD Toggles */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. Shipping Rates & Threshold Card */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <Heading
                level={3}
                className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
              >
                Delivery Charges &amp; Minimum Order Threshold
              </Heading>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Standard Flat Shipping Charge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    Standard Shipping Charge (₹)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    ₹{config.fallbackFlatRate} per order
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.fallbackFlatRate}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        fallbackFlatRate: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-full pl-8 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white h-10"
                    placeholder="e.g. 99"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Flat delivery fee applied to standard shipping when the cart subtotal is below the
                  free shipping threshold. Set to 0 for always free shipping.
                </p>
              </div>

              {/* Free Shipping Minimum Order Value */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    Minimum Order Value for Free Shipping (₹)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {config.freeShippingThreshold > 0
                      ? `Free above ₹${config.freeShippingThreshold}`
                      : 'Disabled (Always charge)'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.freeShippingThreshold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        freeShippingThreshold: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-full pl-8 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white h-10"
                    placeholder="e.g. 2000"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Customers with order subtotals equal to or greater than this value automatically
                  qualify for <strong>FREE Delivery</strong> at checkout. Set to{' '}
                  <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">0</code>{' '}
                  to disable free shipping entirely.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cash on Delivery (COD) Control Card */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <Heading
                  level={3}
                  className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
                >
                  Cash on Delivery (COD) Availability
                </Heading>
              </div>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  config.enableCod
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {config.enableCod ? 'Enabled' : 'Disabled'}
              </span>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">
                    Accept Cash on Delivery at Checkout
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    When active, shoppers can select Cash on Delivery during the payment step. When
                    disabled, COD is hidden and blocked from checkout, and customers must pay online
                    via Razorpay (UPI, Credit/Debit Cards, Netbanking).
                  </p>
                </div>

                {/* Switch Toggle Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.enableCod}
                  onClick={() => setConfig((prev) => ({ ...prev, enableCod: !prev.enableCod }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                    config.enableCod ? 'bg-slate-950' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      config.enableCod ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Server-Enforced Checkout Guard:
                </div>
                <div>
                  Even if a malicious client attempts to forge a COD order payload via API, the
                  server action strictly validates this database setting and rejects the order.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Live Preview & Logistics Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Checkout Experience Simulator */}
          <Card className="border-indigo-200 bg-indigo-50/30 shadow-2xs overflow-hidden">
            <CardHeader className="p-4 border-b border-indigo-100 bg-indigo-50/60 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <Heading
                level={3}
                className="text-xs font-extrabold uppercase tracking-tight text-indigo-950"
              >
                Live Checkout Simulator
              </Heading>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <p className="text-[11px] text-slate-600">
                Here is exactly what customers will experience at checkout with your current
                settings:
              </p>

              {/* Scenario 1: Below threshold */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Cart under ₹{config.freeShippingThreshold} (e.g. ₹799)</span>
                  <span className="text-slate-600">Standard Delivery</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Shipping Fee Applied:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{config.fallbackFlatRate}.00
                  </span>
                </div>
              </div>

              {/* Scenario 2: At or above threshold */}
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span>Cart at ₹{config.freeShippingThreshold}+ (e.g. ₹2,499)</span>
                  <span className="text-emerald-700 font-extrabold">FREE SHIPPING</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-800">
                  <span>Shipping Fee Waived:</span>
                  <span className="font-bold font-mono text-emerald-700">₹0.00 (FREE)</span>
                </div>
              </div>

              {/* Scenario 3: COD payment method */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Payment Step Options</span>
                  <span
                    className={`font-bold ${
                      config.enableCod ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {config.enableCod ? 'Online + COD' : 'Online Only'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {config.enableCod ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Cash on Delivery option will be active and selectable.
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      ✕ Cash on Delivery is hidden. Customers will only be offered Razorpay (UPI, Cards, Netbanking).
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics Provider & Origin Pincode */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <Heading
                level={3}
                className="text-xs font-extrabold uppercase tracking-tight text-slate-900"
              >
                Logistics Provider &amp; Warehouse
              </Heading>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  Active Logistics Provider
                </label>
                <select
                  value={config.activeProvider}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      activeProvider: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 h-9"
                >
                  <option value="shiprocket">Shiprocket Automated Logistics</option>
                  <option value="manual">Manual Flat Rate Fulfillment</option>
                  <option value="delhivery">Delhivery Direct Express</option>
                  <option value="nimbuspost">NimbusPost Aggregator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  Origin / Warehouse Pickup Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={config.defaultPickupPincode}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      defaultPickupPincode: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 h-9"
                  placeholder="500060"
                />
                <p className="text-[10px] text-slate-400">
                  Primary fulfillment dispatch location used for carrier rate serviceability.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-xs uppercase tracking-wider h-10 cursor-pointer shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Apply & Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default ShippingSettingsPanel;
