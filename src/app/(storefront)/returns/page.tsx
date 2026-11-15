import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getReturnsPolicyConfigServer } from '@/app/actions/help-cms-actions';
import { RotateCcw, Check, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export default async function ReturnsPolicyPage() {
  const config = await getReturnsPolicyConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge="15-DAY SATISFACTION"
    >
      <div className="flex flex-col gap-10">
        {/* Core Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              RETURN WINDOW
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {config.returnWindowDays} Days
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Starting from the day your package is marked delivered.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              DOORSTEP PICKUP
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {config.pickupTimeline}
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Complimentary pickup from your original shipping address.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              REFUND DISBURSAL
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {config.refundTimeline}
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Credited directly to your original payment method.
            </p>
          </div>
        </div>

        {/* Return Conditions Checklist */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-white dark:bg-black flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-widest font-heading text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2">
            ELIGIBILITY CRITERIA FOR RETURN OR EXCHANGE
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.conditions.map((cond, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="p-0.5 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  {cond}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Policy Sections */}
        <div className="flex flex-col gap-8">
          {config.sections.map((sec, idx) => (
            <div key={sec.id} className="flex flex-col gap-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-neutral-400">
                  0{idx + 1}.
                </span>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-heading text-neutral-900 dark:text-white">
                  {sec.heading}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light pl-6">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Start Return CTA Box */}
        <div className="border border-neutral-900 dark:border-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-black text-white dark:bg-white dark:text-black">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-black uppercase tracking-tight font-heading">
              Ready to request an exchange or return?
            </h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 font-light">
              Submit your request through your order portal or connect directly with our support team.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="px-6 py-3 bg-white text-black dark:bg-black dark:text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity inline-flex items-center gap-2 shrink-0"
          >
            Go To My Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </HelpLayout>
  );
}

