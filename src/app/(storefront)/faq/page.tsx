import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getFaqConfigServer } from '@/app/actions/help-cms-actions';
import { ChevronDown } from 'lucide-react';

export const revalidate = 60;

export default async function FaqPage() {
  const config = await getFaqConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge="UPDATED 2026"
    >
      <div className="flex flex-col gap-10">
        {config.categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-4">
            <h2 className="text-base font-black tracking-widest uppercase font-heading text-neutral-900 dark:text-white border-b-2 border-black dark:border-white pb-2 inline-block">
              {category.name}
            </h2>

            <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-b border-neutral-200 dark:border-neutral-800">
              {category.items.map((item) => (
                <details
                  key={item.id}
                  className="group py-4 px-2 cursor-pointer transition-colors open:bg-neutral-50/50 dark:open:bg-neutral-950/50"
                >
                  <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-neutral-900 dark:text-white select-none list-none">
                    <span>{item.question}</span>
                    <span className="ml-4 shrink-0 p-1 border border-neutral-300 dark:border-neutral-700 group-open:rotate-180 transition-transform">
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    </span>
                  </summary>
                  <div className="mt-3 pr-8 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </HelpLayout>
  );
}
