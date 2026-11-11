'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/core/utils/cn';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TabLink {
  label: string;
  href: string;
}

export function SupplierTabs() {
  const pathname = usePathname();

  const tabs: TabLink[] = [
    { label: 'overview', href: '/supplier' },
    { label: 'products', href: '/supplier/products' },
    { label: 'offers', href: '/supplier/offers' },
    { label: 'orders', href: '/supplier/orders' },
    { label: 'settings', href: '/supplier/settings' },
  ];

  return (
    <div className="w-full border-b border-slate-200 bg-white mb-8">
      <div className="flex items-center justify-between">
        {/* Horizontal Navigation Tabs */}
        <nav className="flex flex-wrap gap-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/supplier' && pathname?.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative py-4 text-sm font-medium transition-all duration-200 select-none cursor-pointer",
                  isActive 
                    ? "text-slate-900 border-b-2 border-slate-950 font-semibold" 
                    : "text-slate-400 hover:text-slate-700"
                )}
              >
                <span className="flex items-center gap-1.5 lowercase">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Up/Down Page Indicators */}
        <div className="flex items-center gap-1 text-slate-400 select-none">
          <ChevronUp className="h-4 w-4 cursor-pointer hover:text-slate-700 transition-colors" />
          <ChevronDown className="h-4 w-4 cursor-pointer hover:text-slate-700 transition-colors" />
        </div>
      </div>
    </div>
  );
}
export default SupplierTabs;
