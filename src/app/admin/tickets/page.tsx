import * as React from 'react';
import { db } from '@/lib/db';
import { tickets } from '@/lib/db/schema/support/tickets';
import { profiles } from '@/lib/db/schema/auth';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { connection } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { TicketsList } from '@/components/admin/tickets-list';

interface TicketItem {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'closed';
  assignedTo: string | null;
}

/**
 * Admin Support Tickets Management.
 */
export default async function AdminTicketsPage() {
  await connection();

  const [ticketList, staffList] = await Promise.all([
    db.select().from(tickets).orderBy(desc(tickets.createdAt)) as Promise<TicketItem[]>,
    db.select().from(profiles).where(eq(profiles.role, 'admin')),
  ]);

  // Support ticket KPIs
  const openCount = ticketList.filter((t) => t.status === 'open').length;
  const inProgressCount = ticketList.filter((t) => t.status === 'in-progress').length;
  const closedCount = ticketList.filter((t) => t.status === 'closed').length;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Customer Support Tickets
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Moderate customer support ticket queries, update SLAs, and assign staff members.
        </Text>
      </div>

      {/* Ticket KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Queries</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{openCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Progress</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{inProgressCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <Clock className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Closed</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{closedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Moderation Queue</h3>
          </CardHeader>
          <CardContent className="p-0">
            <TicketsList initialTickets={ticketList} staffList={staffList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
