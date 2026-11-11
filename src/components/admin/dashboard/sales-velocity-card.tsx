import * as React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SalesVelocityProps {
  todaySales: number;
  yesterdaySales: number;
  salesTrendPercentage: number;
  sevenDaysSales: number;
  thirtyDaysSales: number;
}

export function SalesVelocityCard({
  todaySales,
  yesterdaySales,
  salesTrendPercentage,
  sevenDaysSales,
  thirtyDaysSales,
}: SalesVelocityProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <CardContent className="p-6 flex flex-col gap-6">
        <h3 className="font-semibold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Sales Velocity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Today</span>
            <span className="text-lg font-bold text-slate-200">${todaySales.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Yesterday</span>
            <span className="text-lg font-bold text-slate-350">${yesterdaySales.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Trend comparison:</span>
          <span className={`font-bold ${salesTrendPercentage >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
            {salesTrendPercentage >= 0 ? '+' : ''}{salesTrendPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Last 7 Days</span>
            <span className="text-sm font-semibold text-slate-300">${sevenDaysSales.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Last 30 Days</span>
            <span className="text-sm font-semibold text-slate-300">${thirtyDaysSales.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
