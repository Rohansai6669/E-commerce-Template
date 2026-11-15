import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getSupportTicketConfigServer } from '@/app/actions/help-cms-actions';
import { SupportTicketForm } from '@/components/storefront/support-ticket-form';
import { Clock, ShieldCheck, Mail, Headphones } from 'lucide-react';

export const revalidate = 60;

export default async function SupportTicketPage() {
  const config = await getSupportTicketConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge="CONCIERGE DESK"
    >
      <div className="flex flex-col gap-8">
        {/* Working Hours & Guarantee Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Operating Window
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-light">
              {config.workingHours}
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <Mail className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Direct Email Inquiries
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-light">
              <a href={`mailto:${config.supportEmail}`} className="underline hover:text-neutral-900 dark:hover:text-white">
                {config.supportEmail}
              </a>
            </p>
          </div>
        </div>

        {/* Support Ticket Submission Form */}
        <SupportTicketForm config={config} />
      </div>
    </HelpLayout>
  );
}

