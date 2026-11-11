import * as React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlatformMarginsProps {
  taxCollected: number;
  shippingRevenue: number;
  platformFees: number;
  refundValue: number;
}

export function PlatformMarginsCard({
  taxCollected,
  shippingRevenue,
  platformFees,
  refundValue,
}: PlatformMarginsProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <CardContent className="p-6 flex flex-col gap-6">
        <h3 className="font-semibold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-amber-400" /> Platform Margins
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-450">Tax Collected</span>
            <span className="font-semibold text-slate-300">${taxCollected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450">Shipping Revenue</span>
            <span className="font-semibold text-slate-300">${shippingRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450">Gateway & Platform Fees</span>
            <span className="font-semibold text-slate-300">${platformFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-850 pt-3">
            <span className="text-slate-450">Returns Refunded</span>
            <span className="font-semibold text-rose-455">${refundValue.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
