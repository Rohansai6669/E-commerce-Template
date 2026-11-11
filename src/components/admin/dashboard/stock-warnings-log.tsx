import * as React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WarningItem {
  id: string;
  name: string;
  quantity: number;
}

interface StockWarningsLogProps {
  items: WarningItem[];
  outOfStockCount: number;
  lowStockCount: number;
}

export function StockWarningsLog({ items, outOfStockCount, lowStockCount }: StockWarningsLogProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">Stock Warnings</h3>
          </div>
          <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">{outOfStockCount} Out</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{lowStockCount} Low</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-slate-450 py-6 text-center select-none">
            All products have healthy inventory levels.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
              >
                <span className="text-slate-700 font-semibold truncate w-48">
                  {item.name}
                </span>
                <span 
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    item.quantity === 0 
                      ? 'bg-rose-950 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.quantity === 0 ? 'Out of stock' : `${item.quantity} left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
