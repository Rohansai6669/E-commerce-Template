import { Header } from '@/components/navigation/Header/header';
import { Footer } from '@/components/navigation/Footer/footer';
import { AdminTabs } from '@/components/admin/admin-tabs';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { returns } from '@/lib/db/schema/support/returns';
import { tickets } from '@/lib/db/schema/support/tickets';
import { eq, inArray } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';
import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentProfile } from '@/core/auth/session';
import { connection } from 'next/server';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Administrative Portal Guard & Layout.
 * Full-width control center layout without boxed container constraints or excessive padding.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  await connection();
  const user = await getCurrentUser();

  // Guard routing - in production redirect to login if not authenticated
  if (!user && process.env.NODE_ENV === 'production') {
    redirect('/login');
  }

  const profile = await getCurrentProfile();
  
  // Enforce role authorization in production
  if (process.env.NODE_ENV === 'production') {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
      redirect('/account');
    }
  }

  // Pre-query badge counts in parallel with safeQuery support
  const [activeOrders, requestedReturns, activeTickets] = await Promise.all([
    safeQuery(() => db.select({ id: orders.id }).from(orders).where(inArray(orders.status, ['pending', 'processing'])), 'badge_orders'),
    safeQuery(() => db.select({ id: returns.id }).from(returns).where(eq(returns.status, 'requested')), 'badge_returns'),
    safeQuery(() => db.select({ id: tickets.id }).from(tickets).where(inArray(tickets.status, ['open', 'in-progress'])), 'badge_tickets'),
  ]);

  const badgeCounts = {
    orders: activeOrders.length,
    returns: requestedReturns.length,
    tickets: activeTickets.length,
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-white text-slate-900 font-sans">
      {/* Storefront Header Navigation bar */}
      <Header />

      {/* Main viewport canvas - Full Width with zero container restrictions */}
      <main className="flex-1 w-full flex flex-col bg-white">
        <div className="w-full flex-1 flex flex-col px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-12">
          {/* Section Breadcrumbs */}
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 select-none">
            Admin
          </span>

          {/* Large Wide Heading Title */}
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase mt-0.5 mb-3 font-heading">
            Control Center
          </h1>

          {/* Horizontal navigation tabs selector */}
          <AdminTabs badgeCounts={badgeCounts} />

          {/* Renders dashboard content viewports full-width */}
          <div className="flex-1 w-full text-slate-900">
            {children}
          </div>
        </div>
      </main>

      {/* Storefront Footer bar */}
      <Footer />
    </div>
  );
}
