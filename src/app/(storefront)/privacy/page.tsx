import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getPrivacyPolicyConfigServer } from '@/app/actions/help-cms-actions';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

export const revalidate = 60;

export default async function PrivacyPolicyPage() {
  const config = await getPrivacyPolicyConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge={`REVISED ${config.lastUpdated.toUpperCase()}`}
    >
      <div className="flex flex-col gap-10">
        {/* Security Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Lock className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              256-Bit SSL Encryption
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Bank-grade tokenized gateway transactions.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <EyeOff className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Zero Data Selling
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              We never broker your credentials or contacts.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <UserCheck className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Data Privacy Officer
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Dedicated grievance contact at {config.contactEmail}.
            </p>
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
      </div>
    </HelpLayout>
  );
}

