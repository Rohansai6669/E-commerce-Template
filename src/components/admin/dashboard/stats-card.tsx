import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  iconColorClass = 'text-slate-900', 
  iconBgClass = 'bg-slate-50 border border-slate-100' 
}: StatsCardProps) {
  return (
    <Card className="border border-slate-200 bg-white rounded shadow-xs">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="text-2xl font-extrabold text-slate-950 tracking-tight font-heading">{value}</span>
        </div>
        <div className={`p-2.5 rounded ${iconColorClass} ${iconBgClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
