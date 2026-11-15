import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getShippingPolicyConfigServer } from '@/app/actions/help-cms-actions';
import { Truck, CheckCircle2, ShieldAlert, Clock, MapPin } from 'lucide-react';

export const revalidate = 60;

export default async function ShippingPolicyPage() {
  const config = await getShippingPolicyConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge="DOMESTIC & EXPRESS"
    >
      <div className="flex flex-col gap-10">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              COMPLIMENTARY SHIPPING
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              ₹{config.freeShippingThreshold.toLocaleString('en-IN')}+
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Automatic zero-charge standard shipping applied at checkout.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              METRO TRANSIT
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {config.metroDeliveryTime}
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              NATIONAL TRANSIT
            </span>
            <div className="text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {config.nationalDeliveryTime}
            </div>
            <p className="text-xs text-neutral-500 font-light">
              Tier-2/3 cities and regional addresses across India.
            </p>
          </div>
        </div>

        {/* Courier Logistics Partners */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-black">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-neutral-900 dark:text-white shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Authorized Logistics Fleet
              </h4>
              <p className="text-xs text-neutral-500">
                Real-time tracking and insured air cargo delivery.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {config.courierPartners.map((partner, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-[11px] font-mono font-bold tracking-wider uppercase border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Editorial Policy Sections */}
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

