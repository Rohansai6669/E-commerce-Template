'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Mail, Clock, HelpCircle, Package, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface HelpLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

const HELP_NAV_LINKS = [
  { label: 'Help Center', href: '/help' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Raise Ticket', href: '/support' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export function HelpLayout({ title, subtitle, badge, children }: HelpLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="w-full bg-white dark:bg-black text-neutral-900 dark:text-white min-h-[85vh] font-sans">
      {/* Top Editorial Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
        <Container className="py-10 sm:py-14">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                LEXIDO · CLIENT SERVICES
              </span>
              {badge && (
                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase font-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </Container>
      </div>

      {/* Main Grid Content */}
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Navigation Column */}
          <aside className="lg:col-span-3 flex flex-col gap-8 sticky top-24">
            <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 p-2 bg-neutral-50/50 dark:bg-neutral-950">
              <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 mb-1">
                HELP NAVIGATION
              </div>
              <nav className="flex flex-col gap-0.5">
                {HELP_NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href === '/shipping' && pathname === '/shipping-policy') ||
                    (link.href === '/returns' && pathname === '/refund-policy') ||
                    (link.href === '/privacy' && pathname === '/privacy-policy');

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'px-3.5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors flex items-center justify-between',
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                      )}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="text-[10px]">●</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Concierge Desk Card */}
            <div className="border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-3 bg-neutral-50/30 dark:bg-neutral-950">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                CLIENT CONCIERGE
              </span>
              <div className="flex flex-col gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <a href="mailto:hello@lexido.in" className="hover:underline font-medium text-neutral-900 dark:text-white">
                    hello@lexido.in
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Mon–Sat, 10am–7pm IST</span>
                </div>
              </div>
              <Link
                href="/support"
                className="mt-2 text-[11px] font-bold uppercase tracking-widest text-center py-2 px-3 border border-neutral-900 dark:border-white text-neutral-900 dark:text-white hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Raise Ticket →
              </Link>
            </div>
          </aside>

          {/* Right Main Column */}
          <main className="lg:col-span-9 flex flex-col gap-8">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default HelpLayout;

