'use client';

import * as React from 'react';
import { trackOrderAction } from '@/app/actions/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

/**
 * Public Guest Order Tracking Page.
 */
export default function TrackOrderPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ status: string; createdAt: Date } | null>(null);
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
    <div className="min-h-[70vh] max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8 justify-center">
      <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
        <Heading level={1} className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Track Your Order
        </Heading>
        <Text className="text-sm text-slate-400">
          Check the delivery status of your package. Input your order number (e.g., ORD-2608-ABCDE) and your billing email.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <Card className="lg:col-span-5 border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2">
            <Heading level={2} className="text-lg font-bold text-slate-100">
              Lookup Details
            </Heading>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Order Number">
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  placeholder="ORD-YYYY-XXXXX"
                  required
                  className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Billing Email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
                  disabled={isPending}
                />
              </FormField>

              {error && (
                <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2 font-semibold cursor-pointer" disabled={isPending}>
                {isPending ? 'Locating Package...' : 'Track Package'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results panel */}
        <Card className="lg:col-span-7 border-slate-800 bg-slate-900/40 min-h-[290px] flex items-center justify-center">
          <CardContent className="p-6 w-full flex items-center justify-center">
            {result ? (
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Status</Text>
                    <Text className="text-lg font-extrabold text-primary capitalize mt-0.5">{result.status}</Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Placed On</Text>
                    <Text className="text-sm font-semibold text-slate-300 mt-0.5">
                      {result.createdAt.toLocaleDateString()}
                    </Text>
                  </div>
                </div>

                {/* Tracking Progress Pipeline */}
                {result.status === 'cancelled' || result.status === 'refunded' ? (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                    <Icon name="XCircle" className="h-5 w-5 text-rose-450 shrink-0" />
                    <div>
                      <Text className="text-xs font-bold text-rose-450 uppercase">Order {result.status}</Text>
                      <Text className="text-xs text-slate-400 mt-0.5">
                        This order has been {result.status}. If this is an error, please reach out to customer care.
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex flex-col gap-6 pl-6 border-l-2 border-slate-800">
                    {STEPS.map((step, idx) => {
                      const isCompleted = idx <= activeStepIdx;
                      const isActive = idx === activeStepIdx;

                      return (
                        <div key={step} className="relative flex items-center gap-4">
                          {/* Node circle */}
                          <div
                            className={`absolute -left-[31px] h-4 w-4 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-colors duration-250 ${
                              isActive
                                ? 'border-primary bg-primary text-slate-950'
                                : isCompleted
                                ? 'border-primary/60 bg-primary/20'
                                : 'border-slate-800'
                            }`}
                          >
                            {isCompleted && (
                              <Icon name="Check" className="h-2 w-2 text-primary-foreground stroke-[3]" />
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider capitalize ${
                                isActive ? 'text-primary' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
                              {step}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {step === 'pending' && 'Order placed and waiting for warehouse pick.'}
                              {step === 'processing' && 'Items are being packaged and prepared for shipping.'}
                              {step === 'shipped' && 'Package has departed our hub. Tracking link active.'}
                              {step === 'delivered' && 'Package has been dropped at your location.'}
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
                <div className="h-10 w-10 bg-slate-800/40 rounded-full flex items-center justify-center text-slate-500 border border-slate-800">
                  <Icon name="Search" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-300 text-sm">No Package Loaded</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Input your guest order credentials on the left side to load package tracking histories.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
