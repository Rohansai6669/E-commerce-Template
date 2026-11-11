import * as React from 'react';
import { connection } from 'next/server';
import { reportsService } from '@/core/reports/reports.service';
import { ReportsDashboard } from '@/components/admin/reports/reports-dashboard';

interface AdminReportsPageProps {
  searchParams: Promise<{ range?: string }>;
}

/**
 * Server Component displaying the Admin Reports & Financial Analytics Suite.
 */
export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await connection();
  const resolvedParams = await searchParams;
  const range = (resolvedParams.range as '7d' | '30d' | '90d' | 'ytd' | 'all') || '30d';

  const reportsData = await reportsService.getReportsData(range);

  return (
    <div className="w-full">
      <ReportsDashboard initialData={reportsData} />
    </div>
  );
}

