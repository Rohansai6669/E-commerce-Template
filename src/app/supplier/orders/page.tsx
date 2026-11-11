import * as React from 'react';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { getCurrentProfile } from '@/core/auth/session';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Clock, CheckCircle2 } from 'lucide-react';
import { connection } from 'next/server';

export default async function SupplierOrdersPage() {
  await connection();

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Consignment Orders & Fulfillment SLA
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Track customer order items routed to your boutique and dispatch shipments within 48 hours.
        </Text>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
          <Clock className="w-4 h-4 text-emerald-600" /> 48-Hour Dispatch SLA Active
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          When customers purchase products from your boutique, order details and shipping labels are generated automatically. Dispatch orders promptly to maintain high seller ratings.
        </p>
      </div>
    </div>
  );
}
