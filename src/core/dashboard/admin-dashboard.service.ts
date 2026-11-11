import { db } from '@/lib/db';
import { safeQuery } from '@/lib/db/safe-query';
import { orders } from '@/lib/db/schema/order';
import { profiles } from '@/lib/db/schema/auth';
import { products } from '@/lib/db/schema/catalog/products';
import { inventory } from '@/lib/db/schema/inventory';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierOrders, supplierOrderItems } from '@/lib/db/schema/marketplace/supplier-orders';
import { supplierLedger } from '@/lib/db/schema/marketplace/supplier-ledger';
import { returns } from '@/lib/db/schema/support/returns';

import { getStoreModeServer } from '@/core/config/store-mode.server';

// ─── DTO Types ───────────────────────────────────────────────

export interface SalesVelocity {
  todaySales: number;
  yesterdaySales: number;
  salesTrendPercentage: number;
  sevenDaysSales: number;
  thirtyDaysSales: number;
}

export interface MarketplaceCore {
  activeSuppliersCount: number;
  pendingSupplierOrdersCount: number;
  supplierTotalRevenue: number;
  pendingSettlements: number;
  commissionEarned: number;
}

export interface PlatformMargins {
  taxCollected: number;
  shippingRevenue: number;
  platformFees: number;
  refundValue: number;
}

export interface StatusItem {
  label: string;
  count: number;
  color: string;
}

export interface WarningItem {
  id: string;
  name: string;
  quantity: number;
}

export interface RecentOrder {
  id: string;
  totalAmount: string;
  status: string;
  createdAt: Date;
  shippingAddress: any;
}

export interface AdminDashboardMetrics {
  grossRevenue: number;
  netRevenue: number;
  averageOrderValue: number;
  customersCount: number;
  productsCount: number;
  salesVelocity: SalesVelocity;
  marketplace: MarketplaceCore;
  margins: PlatformMargins;
  statusItems: StatusItem[];
  lowStockItems: WarningItem[];
  outOfStockCount: number;
  lowStockCount: number;
  recentOrders: RecentOrder[];
}

/**
 * Aggregates business intelligence metrics for the Admin Dashboard.
 *
 * Uses a two-phase query architecture:
 *   Phase 1 (Core)        — orders, profiles, products, inventory, returns → always succeeds
 *   Phase 2 (Marketplace) — suppliers, supplier_orders, supplier_order_items, supplier_ledger → degrades gracefully
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  // ─── Phase 1: Core Metrics (always available) ─────────────
  const [ordersRaw, profilesRaw, productsRaw, inventoryRaw, returnsRaw] = await Promise.all([
    safeQuery(
      () => db.select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        shippingAmount: orders.shippingAmount,
        taxAmount: orders.taxAmount,
        shippingAddress: orders.shippingAddress,
      }).from(orders),
      'orders'
    ),
    safeQuery(
      () => db.select({ id: profiles.id, role: profiles.role }).from(profiles),
      'profiles'
    ),
    safeQuery(
      () => db.select({ id: products.id, name: products.name }).from(products),
      'products'
    ),
    safeQuery(
      () => db.select({
        id: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        lowStockThreshold: inventory.lowStockThreshold,
      }).from(inventory),
      'inventory'
    ),
    safeQuery(
      () => db.select({
        id: returns.id,
        status: returns.status,
        refundAmount: returns.refundAmount,
      }).from(returns),
      'returns'
    ),
  ]);

  // ─── Phase 2: Marketplace Metrics (optional) ──────────────
  const storeMode = await getStoreModeServer();
  const [suppliersRaw, supplierOrdersRaw, supplierOrderItemsRaw, ledgerRaw] = storeMode === 'marketplace'
    ? await Promise.all([
        safeQuery(() => db.select({ id: suppliers.id, status: suppliers.status }).from(suppliers), 'suppliers'),
        safeQuery(() => db.select({ id: supplierOrders.id, status: supplierOrders.status, totalAmount: supplierOrders.totalAmount }).from(supplierOrders), 'supplier_orders'),
        safeQuery(() => db.select({ id: supplierOrderItems.id, commissionAmount: supplierOrderItems.commissionAmount, platformFee: supplierOrderItems.platformFee, paymentGatewayFee: supplierOrderItems.paymentGatewayFee }).from(supplierOrderItems), 'supplier_order_items'),
        safeQuery(() => db.select({ id: supplierLedger.id, credit: supplierLedger.credit, debit: supplierLedger.debit }).from(supplierLedger), 'supplier_ledger'),
      ])
    : [[], [], [], []];

  // ─── Customers & Catalog ──────────────────────────────────
  const customersCount = profilesRaw.filter((p) => p.role === 'customer').length;

  // ─── Inventory Warnings ───────────────────────────────────
  const outOfStockCount = inventoryRaw.filter((i) => i.quantity === 0).length;
  const lowStockCount = inventoryRaw.filter((i) => i.quantity > 0 && i.quantity < i.lowStockThreshold).length;

  const lowStockItems: WarningItem[] = inventoryRaw
    .filter((i) => i.quantity < i.lowStockThreshold)
    .map((inv) => {
      const prod = productsRaw.find((p) => p.id === inv.productId);
      return { id: inv.id, name: prod?.name || 'Unknown Product', quantity: inv.quantity };
    });

  // ─── Finance ──────────────────────────────────────────────
  const activeOrders = ordersRaw.filter((o) => o.status !== 'cancelled');
  const grossRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  const refundValue = returnsRaw
    .filter((r: any) => r.status === 'refunded')
    .reduce((sum: number, r: any) => sum + parseFloat(r.refundAmount || '0'), 0);

  const netRevenue = grossRevenue - refundValue;
  const averageOrderValue = activeOrders.length > 0 ? grossRevenue / activeOrders.length : 0;

  const commissionEarned = supplierOrderItemsRaw.reduce((sum: number, item: any) => sum + parseFloat(item.commissionAmount || '0'), 0);
  const shippingRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.shippingAmount || '0'), 0);
  const taxCollected = activeOrders.reduce((sum, o) => sum + parseFloat(o.taxAmount || '0'), 0);
  const platformFees = supplierOrderItemsRaw.reduce((sum: number, item: any) => sum + parseFloat(item.platformFee || '0') + parseFloat(item.paymentGatewayFee || '0'), 0);

  // ─── Sales Velocity ───────────────────────────────────────
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayOrders = ordersRaw.filter((o) => new Date(o.createdAt) >= startOfToday && o.status !== 'cancelled');
  const yesterdayOrders = ordersRaw.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= startOfYesterday && d < startOfToday && o.status !== 'cancelled';
  });
  const sevenDaysOrders = ordersRaw.filter((o) => new Date(o.createdAt) >= sevenDaysAgo && o.status !== 'cancelled');
  const thirtyDaysOrders = ordersRaw.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo && o.status !== 'cancelled');

  const todaySales = todayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  const sevenDaysSales = sevenDaysOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  const thirtyDaysSales = thirtyDaysOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  let salesTrendPercentage = 0;
  if (yesterdaySales > 0) {
    salesTrendPercentage = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  } else if (todaySales > 0) {
    salesTrendPercentage = 100;
  }

  // ─── Order Pipeline ───────────────────────────────────────
  const getStatusCount = (s: string) => ordersRaw.filter((o) => o.status === s).length;

  const statusItems: StatusItem[] = [
    { label: 'Pending', count: getStatusCount('pending'), color: 'text-amber-450 bg-amber-500/10' },
    { label: 'Processing', count: getStatusCount('processing'), color: 'text-blue-450 bg-blue-500/10' },
    { label: 'Packed', count: getStatusCount('packed'), color: 'text-purple-450 bg-purple-500/10' },
    { label: 'Shipped', count: getStatusCount('shipped'), color: 'text-indigo-450 bg-indigo-500/10' },
    { label: 'Delivered', count: getStatusCount('delivered'), color: 'text-emerald-450 bg-emerald-500/10' },
    { label: 'Cancelled', count: getStatusCount('cancelled'), color: 'text-slate-500 bg-slate-500/10' },
    { label: 'Refunded', count: getStatusCount('refunded'), color: 'text-rose-455 bg-rose-500/10' },
  ];

  // ─── Marketplace ──────────────────────────────────────────
  const activeSuppliersCount = suppliersRaw.filter((s: any) => s.status === 'active').length;
  const pendingSupplierOrdersCount = supplierOrdersRaw.filter((so: any) => so.status === 'pending' || so.status === 'processing').length;
  const supplierTotalRevenue = supplierOrdersRaw.filter((so: any) => so.status !== 'cancelled').reduce((sum: number, so: any) => sum + parseFloat(so.totalAmount || '0'), 0);

  const totalLedgerCredit = ledgerRaw.reduce((sum: number, l: any) => sum + parseFloat(l.credit || '0'), 0);
  const totalLedgerDebit = ledgerRaw.reduce((sum: number, l: any) => sum + parseFloat(l.debit || '0'), 0);
  const pendingSettlements = Math.max(0, totalLedgerCredit - totalLedgerDebit);

  // ─── Recent Orders ────────────────────────────────────────
  const recentOrders: RecentOrder[] = ordersRaw.map((o) => ({
    id: o.id,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt,
    shippingAddress: o.shippingAddress,
  }));

  return {
    grossRevenue,
    netRevenue,
    averageOrderValue,
    customersCount,
    productsCount: productsRaw.length,
    salesVelocity: { todaySales, yesterdaySales, salesTrendPercentage, sevenDaysSales, thirtyDaysSales },
    marketplace: { activeSuppliersCount, pendingSupplierOrdersCount, supplierTotalRevenue, pendingSettlements, commissionEarned },
    margins: { taxCollected, shippingRevenue, platformFees, refundValue },
    statusItems,
    lowStockItems,
    outOfStockCount,
    lowStockCount,
    recentOrders,
  };
}
