'use client';

import * as React from 'react';
import { trackOrderAction } from '@/app/actions/order';
import { TrackOrderConfig } from '@/types/help-pages';
import { Search, Check, XCircle, ArrowRight, Package, Truck, Clock, ExternalLink, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

interface TrackResult {
  status: string;
  createdAt: Date;
  awb?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  latestScan?: { status: string; location: string; activity: string; timestamp: string } | null;
}

interface TrackOrderClientProps {
  config: TrackOrderConfig;
}

export function TrackOrderClient({ config }: TrackOrderClientProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TrackResult | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const orderNumber = formData.get('orderNumber') as string;
    const email = formData.get('email') as string;

    startTransition(async () => {
      const res = await trackOrderAction(orderNumber, email);
      if (res.success && res.status && res.createdAt) {
        setResult({
          status: res.status,
          createdAt: new Date(res.createdAt),
          awb: res.awb,
          courierName: res.courierName,
          trackingUrl: res.trackingUrl,
          estimatedDelivery: res.estimatedDelivery,
          latestScan: res.latestScan,
        });
        toast.success('Order located successfully!');
      } else {
        setError(res.error || 'Failed to locate order.');
        toast.error(res.error || 'Failed to locate order.');
      }
    });
  };

  const getStepIndex = (status: string): number => {
    if (status === 'refunded' || status === 'cancelled') return -1;
    return STEPS.indexOf(status as any);
  };

  const activeStepIdx = result ? getStepIndex(result.status) : -1;

  return (
    <div className="flex flex-col gap-8">
      {/* Notice Banner */}
      <div className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Clock className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
          <span>{config.lookupNotice}</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          {config.courierPartnersNotice}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lookup Form */}
        <div className="lg:col-span-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-black uppercase tracking-widest font-heading text-neutral-900 dark:text-white">
              DISPATCH LOOKUP
            </h3>
            <p className="text-xs text-neutral-500 font-light">
              Enter your credentials below to inspect live order state.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Order Reference *
              </label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                placeholder="e.g. ORD-2608-ABCDE"
                required
                disabled={isPending}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Billing Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isPending}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {isPending ? 'Querying Courier Network...' : 'Locate Order →'}
            </button>
          </form>

          <p className="text-[11px] text-neutral-500 leading-relaxed font-light border-t border-neutral-200 dark:border-neutral-800 pt-3">
            {config.helpLinkText}{' '}
            <Link href="/support" className="underline font-medium text-neutral-900 dark:text-white">
              Contact Concierge
            </Link>
          </p>
        </div>

        {/* Results Pipeline */}
        <div className="lg:col-span-7 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-6 sm:p-8 min-h-[340px] flex items-center justify-center">
          {result ? (
            <div className="w-full flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                    CURRENT DISPATCH STATE
                  </span>
                  <div className="text-xl font-black uppercase tracking-tight font-heading text-neutral-900 dark:text-white mt-0.5">
                    {result.status}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                    ORDER INITIATED
                  </span>
                  <div suppressHydrationWarning className="text-xs font-mono font-bold text-neutral-900 dark:text-white mt-0.5">
                    {new Date(result.createdAt).toISOString().split('T')[0]}
                  </div>
                </div>
              </div>

              {/* Carrier & AWB Logistics Snapshot (Shiprocket Integration) */}
              {result.awb && (
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-900 dark:text-white" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                        {result.courierName || 'Shiprocket Partner'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                      AWB: {result.awb}
                    </span>
                  </div>

                  {result.latestScan && (
                    <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900 dark:text-neutral-200">
                          {result.latestScan.activity} {result.latestScan.location ? `— ${result.latestScan.location}` : ''}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(result.latestScan.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.trackingUrl && (
                    <a
                      href={result.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span>Track Live on Carrier Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {result.status === 'cancelled' || result.status === 'refunded' ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                      Order {result.status}
                    </span>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      This order has been {result.status}. For clarifications, connect with our concierge.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col gap-6 pl-6 border-l border-neutral-300 dark:border-neutral-700 ml-2">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeStepIdx;
                    const isActive = idx === activeStepIdx;

                    return (
                      <div key={step} className="relative flex items-center gap-4">
                        <div
                          className={`absolute -left-[31px] h-3.5 w-3.5 border flex items-center justify-center ${
                            isActive
                              ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                              : isCompleted
                              ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                              : 'border-neutral-400 bg-white dark:bg-black'
                          }`}
                        >
                          {isCompleted && <Check className="h-2 w-2 stroke-[3]" />}
                        </div>

                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isActive
                                ? 'text-black dark:text-white underline'
                                : isCompleted
                                ? 'text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-400'
                            }`}
                          >
                            {step}
                          </span>
                          <span className="text-[11px] text-neutral-500 mt-0.5">
                            {step === 'pending' && 'Order received and confirmed in atelier pipeline.'}
                            {step === 'processing' && 'Garment undergoing quality audit and luxury packaging.'}
                            {step === 'shipped' && 'Handed over to carrier. Airway bill active.'}
                            {step === 'delivered' && 'Package completed delivery to your doorstep.'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <div className="h-10 w-10 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Awaiting Credentials
                </h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs font-light">
                  Input your Order Reference and Billing Email on the left to pull live status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

