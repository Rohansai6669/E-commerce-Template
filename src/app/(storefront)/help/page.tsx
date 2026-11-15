import * as React from 'react';
import Link from 'next/link';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getHelpCenterConfigServer } from '@/app/actions/help-cms-actions';
import { ArrowUpRight, HelpCircle, Package, RotateCcw, ShieldCheck, Mail, Phone, Clock } from 'lucide-react';

export const revalidate = 60;

export default async function HelpCenterPage() {
  const config = await getHelpCenterConfigServer();

  return (
    <HelpLayout
      title={config.heroTitle}
      subtitle={config.heroSubtitle}
      badge="CLIENT CARE"
    >
      <div className="flex flex-col gap-12">
        {/* Quick Action Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.quickCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black hover:border-black dark:hover:border-white transition-all flex flex-col justify-between gap-4 relative"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  PORTAL
                </span>
                {card.badge ? (
                  <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {card.badge}
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-black uppercase tracking-tight font-heading group-hover:underline">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                  {card.description}
                </p>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white inline-flex items-center gap-1">
                Access Service →
              </div>
            </Link>
          ))}
        </div>

        {/* Highlights FAQ Section */}
        {config.highlightFaqs && config.highlightFaqs.length > 0 && (
          <div className="flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-widest font-heading text-neutral-900 dark:text-white">
                FREQUENTLY ASKED ESSENTIALS
              </h2>
              <Link href="/faq" className="text-xs font-bold uppercase tracking-wider underline hover:opacity-75">
                View All FAQs →
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
              {config.highlightFaqs.map((faq) => (
                <div key={faq.id} className="py-4 flex flex-col gap-1.5">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {faq.question}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Contact Hours Block */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white dark:bg-black">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              DIRECT CHANNELS
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight font-heading">
              Need personalized assistance?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Our styling concierge and logistics specialists are available {config.workingHours}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${config.supportEmail}`}
              className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Concierge
            </a>
            <Link
              href="/support"
              className="px-5 py-2.5 border border-black dark:border-white text-black dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors inline-flex items-center gap-2"
            >
              Raise Ticket
            </Link>
          </div>
        </div>
      </div>
    </HelpLayout>
  );
}

