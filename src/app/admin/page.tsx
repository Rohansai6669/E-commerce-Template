import * as React from 'react';
import { getAdminDashboardMetrics } from '@/core/dashboard/admin-dashboard.service';
import { connection } from 'next/server';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  FolderIcon
} from 'lucide-react';
import { StatsCard } from '@/components/admin/dashboard/stats-card';
import { RecentOrdersLog } from '@/components/admin/dashboard/recent-orders-log';
import { StockWarningsLog } from '@/components/admin/dashboard/stock-warnings-log';

/**
 * Server Component hosting the Admin Dashboard Overview.
 * Delegated to the getAdminDashboardMetrics service layer for core query aggregations.
 */
export default async function AdminDashboardOverview() {
  await connection();

  // Fetch compiled business intelligence metrics DTO from the service layer
  const metrics = await getAdminDashboardMetrics();

  // Format currency in Indian Rupees matching the Lexido aesthetic screenshots
  const formattedRevenue = metrics.grossRevenue.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="flex flex-col gap-8 w-full text-slate-900 pb-12">
      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="revenue" 
          value={formattedRevenue}
          icon={DollarSign}
          iconColorClass="text-slate-900"
          iconBgClass="bg-slate-50 border border-slate-200/50"
        />
        <StatsCard 
          label="orders" 
          value={metrics.recentOrders.length.toString()}
          icon={ShoppingBag}
          iconColorClass="text-slate-900"
          iconBgClass="bg-slate-50 border border-slate-200/50"
        />
        <StatsCard 
          label="customers" 
          value={metrics.customersCount.toLocaleString()}
          icon={Users}
          iconColorClass="text-slate-900"
          iconBgClass="bg-slate-50 border border-slate-200/50"
        />
        <StatsCard 
          label="products" 
          value={metrics.productsCount.toLocaleString()}
          icon={FolderIcon}
          iconColorClass="text-slate-900"
          iconBgClass="bg-slate-50 border border-slate-200/50"
        />
      </div>

      {/* Tables summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentOrdersLog orders={metrics.recentOrders} />
        </div>
        <div>
          <StockWarningsLog 
            items={metrics.lowStockItems}
            outOfStockCount={metrics.outOfStockCount}
            lowStockCount={metrics.lowStockCount}
          />
        </div>
      </div>
    </div>
  );
}
