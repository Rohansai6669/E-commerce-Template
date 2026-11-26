'use client';

import * as React from 'react';
import { trackOrderAction } from '@/app/actions/order';
import { TrackOrderConfig } from '@/types/help-pages';
import { Search, Check, XCircle, ArrowRight, Package, Truck, Clock, ExternalLink, MapPin, Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

interface TrackResult {
  status: string;
  createdAt: Date;
  orderNumber?: string | null;
  destinationCity?: string | null;
  awb?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  latestScan?: { status: string; location: string; activity: string; timestamp: string } | null;
  activities?: Array<{ date: string; status: string; activity: string; location: string }>;
}

interface TrackOrderClientProps {
  config: TrackOrderConfig;
}

export function TrackOrderClient({ config }: TrackOrderClientProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TrackResult | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleCopyAwb = (awbCode: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(awbCode);
      setIsCopied(true);
      toast.success('AWB copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const orderNumber = (formData.get('orderNumber') as string || '').trim();
    const emailOrPhone = (formData.get('email') as string || '').trim();

    startTransition(async () => {
      const res = await trackOrderAction(orderNumber, emailOrPhone);
      if (res.success && res.status && res.createdAt) {
        setResult({
          status: res.status,
          createdAt: new Date(res.createdAt),
          orderNumber: res.orderNumber,
          destinationCity: res.destinationCity,
          awb: res.awb,
          courierName: res.courierName,
          trackingUrl: res.trackingUrl,
          estimatedDelivery: res.estimatedDelivery,
          latestScan: res.latestScan,
          activities: res.activities,
        });
        toast.success('Order located & synced with carrier network!');
      } else {
        setError(res.error || 'Failed to locate order.');
        toast.error(res.error || 'Failed to locate order.');
      }
    });
  };

  const getStepIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s === 'refunded' || s === 'cancelled') return -1;
    if (s === 'delivered') return 3;
    if (s === 'shipped' || s.includes('transit') || s.includes('delivery')) return 2;
    if (s === 'processing' || s === 'confirmed') return 1;
    return 0;
  };

  const activeStepIdx = result ? getStepIndex(result.status) : -1;

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Notice Banner */}
      <div className="border border-border p-4 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-foreground shrink-0" />
          <span>{config.lookupNotice}</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
          {config.courierPartnersNotice}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lookup Form */}
        <div className="lg:col-span-5 border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col gap-1 border-b border-border pb-3">
            <h3 className="text-sm font-black uppercase tracking-widest font-heading text-foreground">
              DISPATCH LOOKUP
            </h3>
            <p className="text-xs text-muted-foreground font-light">
              Enter your Order ID, reference, or Shiprocket AWB number to inspect live telemetry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Order Reference or AWB Number *
              </label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                placeholder="e.g. ORD-2608-ABCDE or AWB 1432543210"
                required
                disabled={isPending}
                className="w-full bg-background border border-input px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none rounded-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Billing Email or Mobile Number *
              </label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="name@example.com or 9876543210"
                required
                disabled={isPending}
                className="w-full bg-background border border-input px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none rounded-none"
              />
            </div>

            {error && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-none shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              {isPending ? 'Syncing Carrier Telemetry...' : 'Locate & Sync Order →'}
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground leading-relaxed font-light border-t border-border pt-3">
            {config.helpLinkText}{' '}
            <Link href="/support" className="underline font-medium text-foreground hover:opacity-80">
              Contact Concierge
            </Link>
          </p>
        </div>

        {/* Results Pipeline */}
        <div className="lg:col-span-7 border border-border bg-card p-6 sm:p-8 min-h-[340px] flex items-center justify-center shadow-xs">
          {result ? (
            <div className="w-full flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    CURRENT DISPATCH STATE
                  </span>
                  <div className="text-xl font-black uppercase tracking-tight font-heading text-foreground mt-0.5">
                    {result.status}
                  </div>
                  {result.destinationCity && (
                    <span className="text-[11px] text-muted-foreground font-sans">
                      Destination: {result.destinationCity}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    ORDER INITIATED
                  </span>
                  <div suppressHydrationWarning className="text-xs font-mono font-bold text-foreground mt-0.5">
                    {new Date(result.createdAt).toISOString().split('T')[0]}
                  </div>
                  {result.orderNumber && (
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Ref: {result.orderNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Estimated Delivery Date Card */}
              {result.estimatedDelivery && (
                <div className="p-3.5 bg-muted/40 border border-border flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-foreground shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider">Estimated Delivery: </span>
                    <strong className="text-foreground">{result.estimatedDelivery}</strong>
                  </div>
                </div>
              )}

              {/* Carrier & AWB Logistics Snapshot (Shiprocket Integration) */}
              {result.awb && (
                <div className="p-4 bg-background border border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {result.courierName || 'Shiprocket Partner'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted text-foreground border border-border">
                        AWB: {result.awb}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAwb(result.awb!)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy AWB number"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {result.latestScan && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-2">
                      <MapPin className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {result.latestScan.activity} {result.latestScan.location ? `— ${result.latestScan.location}` : ''}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
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
                      className="mt-1 w-full py-2.5 px-4 bg-foreground text-background text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity rounded-none"
                    >
                      <span>Track Live on Carrier Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Live Shiprocket Courier Milestones Timeline */}
              {result.activities && result.activities.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground font-mono">
                    Shipment Milestones ({result.activities.length})
                  </span>
                  <div className="relative flex flex-col gap-4 pl-4 border-l-2 border-border ml-1.5 py-1">
                    {result.activities.map((act, i) => (
                      <div key={i} className="relative flex flex-col gap-0.5">
                        <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-foreground border border-background" />
                        <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                          <span className="font-bold text-foreground">{act.activity || act.status}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{act.date}</span>
                        </div>
                        {act.location && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3 shrink-0" /> {act.location}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order State Pipeline Progress */}
              {result.status === 'cancelled' || result.status === 'refunded' ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                      Order {result.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This order has been {result.status}. For clarifications, connect with our concierge.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col gap-6 pl-6 border-l border-border ml-2 pt-2">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeStepIdx;
                    const isActive = idx === activeStepIdx;

                    return (
                      <div key={step} className="relative flex items-center gap-4">
                        <div
                          className={`absolute -left-[31px] h-3.5 w-3.5 border flex items-center justify-center ${
                            isActive
                              ? 'border-foreground bg-foreground text-background'
                              : isCompleted
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-background'
                          }`}
                        >
                          {isCompleted && <Check className="h-2 w-2 stroke-[3]" />}
                        </div>

                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isActive
                                ? 'text-foreground underline'
                                : isCompleted
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {step}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
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
              <div className="h-10 w-10 border border-border flex items-center justify-center text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Awaiting Credentials
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs font-light">
                  Input your Order Reference / AWB and Billing Email / Phone on the left to pull live status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

