import { Header } from '@/components/navigation/Header/header';
import { Footer } from '@/components/navigation/Footer/footer';
import { Container } from '@/components/layout/container';
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
 * Standardized to match the storefront's light theme control center layouts.
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

      {/* Main viewport canvas */}
      <main className="flex-1 w-full flex flex-col bg-white">
        <Container className="py-6 sm:py-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex-1 w-full flex flex-col">
          {/* Section Breadcrumbs */}
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 select-none">
            Admin
          </span>

          {/* Large Wide Heading Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 uppercase mt-1 mb-4 sm:mb-6 font-heading">
            Control Center
          </h1>

          {/* Horizontal navigation tabs selector */}
          <AdminTabs badgeCounts={badgeCounts} />

          {/* Renders dashboard content viewports */}
          <div className="flex-1 w-full text-slate-900">
            {children}
          </div>
        </Container>
      </main>

      {/* Storefront Footer bar */}
      <Footer />
    </div>
  );
}
