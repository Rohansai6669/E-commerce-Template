import * as React from 'react';
import { db } from '@/lib/db';
import { returns } from '@/lib/db/schema/support/returns';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { connection } from 'next/server';
import { desc } from 'drizzle-orm';
import { RotateCcw, ShieldCheck, DollarSign } from 'lucide-react';
import { ReturnsList } from '@/components/admin/returns-list';

interface ReturnItem {
  id: string;
  reason: string;
  qcResult: string | null;
  status: 'requested' | 'approved' | 'item_received' | 'qc_passed' | 'qc_failed' | 'refunded' | 'rejected';
  refundAmount: string | null;
}

/**
 * Admin returns control panel.
 */
export default async function AdminReturnsPage() {
  await connection();

  const list = await db.select().from(returns).orderBy(desc(returns.createdAt)) as ReturnItem[];

  // Support returns KPIs
  const requestedCount = list.filter((r) => r.status === 'requested').length;
  const qcPassedCount = list.filter((r) => r.status === 'qc_passed').length;
  const refundedCount = list.filter((r) => r.status === 'refunded').length;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          QC & Returns Board
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Moderate customer return requests, perform quality controls, and trigger refunds ledger credits.
        </Text>
      </div>

      {/* Returns KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting QC</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{requestedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <RotateCcw className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QC Passed</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{qcPassedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Refunded Credits</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{refundedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Returns Moderation Queue</h3>
          </CardHeader>
          <CardContent className="p-0">
            <ReturnsList initialReturns={list} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
