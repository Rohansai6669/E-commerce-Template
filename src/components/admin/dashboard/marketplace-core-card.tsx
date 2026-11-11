import * as React from 'react';
import { Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MarketplaceCoreProps {
  activeSuppliersCount: number;
  pendingSupplierOrdersCount: number;
  supplierTotalRevenue: number;
  pendingSettlements: number;
  commissionEarned: number;
}

export function MarketplaceCoreCard({
  activeSuppliersCount,
  pendingSupplierOrdersCount,
  supplierTotalRevenue,
  pendingSettlements,
  commissionEarned,
}: MarketplaceCoreProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <CardContent className="p-6 flex flex-col gap-6">
        <h3 className="font-semibold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-400" /> Marketplace Core
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 font-semibold text-xs">Active Suppliers</span>
            <span className="font-bold text-slate-200 text-base">{activeSuppliersCount}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 font-semibold text-xs">Pending Orders</span>
            <span className="font-bold text-slate-200 text-base">{pendingSupplierOrdersCount}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 font-semibold text-xs">Supplier Revenue</span>
            <span className="font-bold text-slate-200 text-base">${supplierTotalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 font-semibold text-xs">Ledger Balance</span>
            <span className="font-bold text-slate-200 text-base">${pendingSettlements.toFixed(2)}</span>
          </div>
        </div>
        <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-xs mt-1">
          <span className="text-slate-450 font-semibold uppercase">Platform Commissions</span>
          <span className="font-bold text-emerald-450">${commissionEarned.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
