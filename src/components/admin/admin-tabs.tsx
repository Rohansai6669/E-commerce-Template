'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/core/utils/cn';
import { getStoreModeClient, type StoreMode } from '@/core/config/store-mode';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TabLink {
  label: string;
  href: string;
  badgeKey?: 'orders' | 'returns' | 'tickets';
  requiresMarketplace?: boolean;
}

interface AdminTabsProps {
  badgeCounts: {
    orders: number;
    returns: number;
    tickets: number;
  };
}

export function AdminTabs({ badgeCounts }: AdminTabsProps) {
  const pathname = usePathname();
  const [storeMode, setStoreMode] = React.useState<StoreMode>('standalone');

  React.useEffect(() => {
    setStoreMode(getStoreModeClient());
  }, []);

  const allTabs: TabLink[] = [
    { label: 'dashboard', href: '/admin' },
    { label: 'orders', href: '/admin/orders', badgeKey: 'orders' },
    { label: 'products', href: '/admin/products' },
    { label: 'categories', href: '/admin/categories' },
    { label: 'brands', href: '/admin/brands' },
    { label: 'attributes', href: '/admin/attributes' },
    { label: 'cms', href: '/admin/cms' },
    { label: 'media', href: '/admin/media' },
    { label: 'customers', href: '/admin/customers' },
    { label: 'suppliers', href: '/admin/suppliers', requiresMarketplace: true },
    { label: 'approvals', href: '/admin/suppliers/approvals', requiresMarketplace: true },
    { label: 'tickets', href: '/admin/tickets', badgeKey: 'tickets' },
    { label: 'returns', href: '/admin/returns', badgeKey: 'returns' },
    { label: 'reviews', href: '/admin/reviews' },
    { label: 'promotions', href: '/admin/promotions' },
    { label: 'reports', href: '/admin/reports' },
    { label: 'settings', href: '/admin/settings' },
  ];

  const tabs = allTabs.filter(
    (tab) => !tab.requiresMarketplace || storeMode === 'marketplace'
  );

  return (
    <div className="w-full border-b border-slate-200 bg-white mb-8">
      <div className="flex items-center justify-between">
        {/* Horizontal Navigation Tabs */}
        <nav className="flex flex-wrap gap-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/admin' && pathname?.startsWith(tab.href));
            const badgeCount = tab.badgeKey ? badgeCounts[tab.badgeKey] : 0;

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
                  {badgeCount > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {badgeCount}
                    </span>
                  )}
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
export default AdminTabs;
