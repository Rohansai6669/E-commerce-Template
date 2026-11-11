'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/core/utils/cn';
import { getStoreModeClient, type StoreMode } from '@/core/config/store-mode';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Home, 
  Users, 
  FolderTree, 
  Tag, 
  Star, 
  Percent,
  Layers,
  MessageSquare,
  RotateCcw,
  Settings,
  Sliders,
  Image as ImageIcon,
  LayoutTemplate,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badgeKey?: 'orders' | 'returns' | 'tickets';
  requiresMarketplace?: boolean;
}

interface AdminSidebarProps {
  userEmail: string;
  badgeCounts: {
    orders: number;
    returns: number;
    tickets: number;
  };
}

export function AdminSidebar({ userEmail, badgeCounts }: AdminSidebarProps) {
  const pathname = usePathname();
  const [storeMode, setStoreMode] = React.useState<StoreMode>('standalone');

  React.useEffect(() => {
    setStoreMode(getStoreModeClient());
  }, []);

  const allSidebarLinks: SidebarLink[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Brands', href: '/admin/brands', icon: Tag },
    { label: 'Attributes', href: '/admin/attributes', icon: Sliders },
    { label: 'CMS Content', href: '/admin/cms', icon: LayoutTemplate },
    { label: 'Media Files', href: '/admin/media', icon: ImageIcon },
    { label: 'Orders', href: '/admin/orders', icon: Receipt, badgeKey: 'orders' },
    { label: 'Returns', href: '/admin/returns', icon: RotateCcw, badgeKey: 'returns' },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Suppliers', href: '/admin/suppliers', icon: Layers, requiresMarketplace: true },
    { label: 'Approvals', href: '/admin/suppliers/approvals', icon: ShieldCheck, requiresMarketplace: true },
    { label: 'Tickets', href: '/admin/tickets', icon: MessageSquare, badgeKey: 'tickets' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Promotions', href: '/admin/promotions', icon: Sparkles },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const sidebarLinks = allSidebarLinks.filter(
    (link) => !link.requiresMarketplace || storeMode === 'marketplace'
  );

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col justify-between p-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-primary font-heading">
            Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1 select-none">
            Store Control Panel
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));
            const badgeCount = link.badgeKey ? badgeCounts[link.badgeKey] : 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[14px]" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-slate-450 group-hover:text-slate-200")} />
                  <span>{link.label}</span>
                </div>
                {badgeCount > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors",
                    isActive ? "bg-primary text-slate-950" : "bg-slate-800 text-slate-350"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-850 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-450 hover:text-slate-200 transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          Storefront Home
        </Link>
        <div className="px-4 py-2 text-xs text-slate-500 select-none">
          Logged in as:<br />
          <span className="text-slate-400 font-semibold truncate block w-48">
            {userEmail}
          </span>
        </div>
      </div>
    </aside>
  );
}
