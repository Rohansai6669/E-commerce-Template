'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type EcommerceReportsData } from '@/core/reports/reports.service';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Download,
  Calendar,
  Users,
  Package,
  RotateCcw,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportsDashboardProps {
  initialData: EcommerceReportsData;
}

export function ReportsDashboard({ initialData }: ReportsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = (searchParams.get('range') as any) || initialData.timeRange || '30d';

  const handleRangeChange = (rangeKey: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('range', rangeKey);
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  const handleExportCsv = () => {
    if (!initialData.exportableRows || initialData.exportableRows.length === 0) {
      toast.error('No orders available to export in this time range.');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer Email',
      'Status',
      'Subtotal',
      'Cost (COGS)',
      'Gross Profit',
      'Discount',
      'Tax',
      'Shipping',
      'Total Amount',
    ];

    const csvContent = [
      headers.join(','),
      ...initialData.exportableRows.map((row) =>
        [
          `"${row.orderNumber}"`,
          `"${row.date}"`,
          `"${row.customerEmail}"`,
          `"${row.status}"`,
          `"${row.subtotal}"`,
          `"${row.cost}"`,
          `"${row.profit}"`,
          `"${row.discount}"`,
          `"${row.tax}"`,
          `"${row.shipping}"`,
          `"${row.total}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecommerce-report-${currentRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report CSV exported successfully!');
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const { financials, orders, topProducts, categories, promotions, customers, salesTimeline } = initialData;

  const maxTimelineSales = Math.max(...salesTimeline.map((s) => s.sales), 1);

  return (
    <div className="flex flex-col gap-8 w-full text-slate-900 pb-16 font-sans">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 font-heading flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-slate-900" />
            Executive E-Commerce Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Financial reconciliation, order volume velocity, category margins, and promotional discount tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'ytd', label: 'YTD' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider ${
                  currentRange === r.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-950 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs hover:shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Net Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 font-heading">
            {formatCurrency(financials.netRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">Realized sales after returns</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Cost of Goods (COGS)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 font-heading">
            {formatCurrency(financials.costOfGoodsSold)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">Snapshotted inventory acquisition cost</span>
        </div>

        <div className="p-5 bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Gross Profit</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {financials.profitMarginPercentage.toFixed(1)}% margin
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700 font-heading">
            {formatCurrency(financials.grossProfit)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">Revenue minus cost of goods sold</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Average Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 font-heading">
            {formatCurrency(financials.averageOrderValue)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">Across {orders.totalOrders} total orders</span>
        </div>
      </div>

      {/* Financial Breakdown Chips */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gross Sales</span>
          <span className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(financials.grossRevenue)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Discounts Given</span>
          <span className="text-base font-bold text-rose-600 mt-0.5">{formatCurrency(financials.totalDiscounts)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tax Collected</span>
          <span className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(financials.taxCollected)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Shipping Fees</span>
          <span className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(financials.shippingCollected)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Refunds Issued</span>
          <span className="text-base font-bold text-rose-600 mt-0.5">{formatCurrency(financials.refundsIssued)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Return Rate</span>
          <span className="text-base font-bold text-slate-900 mt-0.5">{orders.returnRate}%</span>
        </div>
      </div>

      {/* Sales Velocity Timeline / Trend Bar Chart */}
      {salesTimeline.length > 0 && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading">
                Daily Sales Velocity & Order Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological sales progression during the selected period.</p>
            </div>
          </div>

          <div className="flex items-end gap-2 h-44 w-full pt-4 overflow-x-auto pb-2 scrollbar-thin">
            {salesTimeline.map((pt) => {
              const heightPct = Math.max(10, Math.round((pt.sales / maxTimelineSales) * 100));
              return (
                <div key={pt.date} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{pt.sales}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-slate-900 group-hover:bg-indigo-600 rounded-t-md transition-all shadow-xs"
                    title={`${pt.date}: ₹${pt.sales} (${pt.orders} orders)`}
                  />
                  <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                    {pt.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle Row: Order Fulfillment Pipeline & Customer Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading mb-1">
            Order Fulfillment Pipeline
          </h3>
          <p className="text-xs text-slate-500 mb-6">Real-time status breakdown across all placed orders.</p>

          <div className="space-y-3.5">
            {orders.ordersByStatus.length > 0 ? (
              orders.ordersByStatus.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-slate-800">{item.status}</span>
                    <span className="text-slate-500">
                      {item.count} orders ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className={`h-full rounded-full ${
                        item.status === 'delivered'
                          ? 'bg-emerald-500'
                          : item.status === 'cancelled'
                          ? 'bg-rose-500'
                          : item.status === 'shipped'
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No order records found in this range.</p>
            )}
          </div>
        </div>

        {/* Customer Retention & LTV Metrics */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading mb-1">
              Customer Retention & Acquisition
            </h3>
            <p className="text-xs text-slate-500 mb-6">Customer growth and repeat purchase propensity.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Customers</span>
                <div className="text-2xl font-black text-slate-950 mt-1">{customers.totalCustomers}</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">New in Period</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">+{customers.newCustomersPeriod}</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Repeat Buyers</span>
                <div className="text-2xl font-black text-indigo-600 mt-1">{customers.repeatBuyersCount}</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Repeat Purchase Rate</span>
                <div className="text-2xl font-black text-slate-950 mt-1">{customers.repeatPurchaseRate}%</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Customer Lifetime Value Health</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Healthy Trajectory
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Products, Categories & Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading mb-1">
            Top Performing Products
          </h3>
          <p className="text-xs text-slate-500 mb-4">Ranked by volume and sales revenue.</p>

          <div className="divide-y divide-slate-100">
            {topProducts.length > 0 ? (
              topProducts.map((p, idx) => (
                <div key={p.productId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 max-w-[65%]">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-950">{formatCurrency(p.revenue)}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      Profit {formatCurrency(p.profit)} ({p.margin.toFixed(0)}%)
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{p.unitsSold} sold</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No product orders recorded.</p>
            )}
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading mb-1">
            Category Contribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Sales share by product category.</p>

          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.categoryName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{cat.categoryName}</span>
                    <span className="text-slate-500">{formatCurrency(cat.revenue)} ({cat.sharePercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${cat.sharePercentage}%` }} className="bg-slate-900 h-full rounded-full" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No category sales recorded.</p>
            )}
          </div>
        </div>

        {/* Promotions & Coupon Performance */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 font-heading mb-1">
            Promotions & Coupon Analytics
          </h3>
          <p className="text-xs text-slate-500 mb-4">Redemption frequency and discount impact.</p>

          <div className="divide-y divide-slate-100">
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <div key={promo.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-slate-950 font-mono tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {promo.code}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{promo.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{promo.redemptions} used</div>
                    {promo.discountGiven > 0 && (
                      <div className="text-[10px] text-rose-500 font-bold">
                        -{formatCurrency(promo.discountGiven)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No coupon redemptions recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

