import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { Cookie, ShieldCheck, Sliders, Info } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy | Lexido',
  description: 'Understand how we use cookies and manage your personal tracking preferences.',
};

export default function CookiePolicyPage() {
  return (
    <HelpLayout
      title="Cookie Policy"
      subtitle="How we utilize essential, functional, and performance cookies on Lexido."
      badge="PRIVACY TRANSPARENCY"
    >
      <div className="flex flex-col gap-10">
        {/* Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              Essential Only
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Cart persistence and user authentication tokens strictly required for operation.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Sliders className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              Your Control
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Opt in or out of analytical and behavioral personalization anytime.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Cookie className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              No 3rd-Party Brokers
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Zero cross-site tracking or sale of telemetry to external advertising networks.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 text-neutral-700 dark:text-neutral-300">
          <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              01. What Are Cookies?
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Cookies are small text files stored on your computer or mobile device when you browse websites. They enable the store to remember your actions and preferences (such as shopping bag contents, selected currency, and active login credentials) over a period of time.
            </p>
          </div>

          <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              02. Categories of Cookies We Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <span className="font-bold text-foreground block mb-1">Strictly Necessary Cookies</span>
                <p className="text-muted-foreground leading-relaxed">
                  Required to authenticate sessions, secure transactions, and maintain your bag contents throughout checkout. Cannot be disabled.
                </p>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <span className="font-bold text-foreground block mb-1">Performance &amp; Analytics</span>
                <p className="text-muted-foreground leading-relaxed">
                  Helps us understand page speed, low latency search queries, and catalog navigation patterns to improve store performance.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              03. Managing Your Browser Settings
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              You can configure your browser to reject all or certain cookies, or to alert you when websites set or access cookies. Please note that disabling essential cookies may impact checkout functionality and prevent you from completing transactions.
            </p>
          </div>
        </div>
      </div>
    </HelpLayout>
  );
}

