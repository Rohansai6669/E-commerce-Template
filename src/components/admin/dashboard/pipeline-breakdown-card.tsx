import * as React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatusItem {
  label: string;
  count: number;
  color: string;
}

interface PipelineBreakdownProps {
  statusItems: StatusItem[];
}

export function PipelineBreakdownCard({ statusItems }: PipelineBreakdownProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <CardContent className="p-6 flex flex-col gap-6">
        <h3 className="font-semibold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
          <Truck className="h-4 w-4 text-blue-400" /> Orders Pipeline Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {statusItems.map((st) => (
            <div 
              key={st.label} 
              className="p-4 rounded-lg border border-slate-850 bg-slate-900/10 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-xs text-slate-500 font-semibold">{st.label}</span>
              <span className={`text-xl font-bold px-3 py-0.5 rounded-full ${st.color}`}>{st.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
