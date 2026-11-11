import { db } from '@/lib/db';
import { safeQuery } from '@/lib/db/safe-query';
import { orders, orderItems } from '@/lib/db/schema/order';
import { profiles } from '@/lib/db/schema/auth';
import { products } from '@/lib/db/schema/catalog/products';
import { categories } from '@/lib/db/schema/catalog/categories';
import { coupons, couponRedemptions } from '@/lib/db/schema/marketing';
import { returns } from '@/lib/db/schema/support/returns';
import { desc, sql, eq } from 'drizzle-orm';

export interface FinancialMetrics {
  grossRevenue: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  profitMarginPercentage: number;
  totalDiscounts: number;
  taxCollected: number;
  shippingCollected: number;
  refundsIssued: number;
  averageOrderValue: number;
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  returnRate: number;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
}

export interface TopProductMetric {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface CategoryMetric {
  categoryName: string;
  revenue: number;
  unitsSold: number;
  sharePercentage: number;
}

export interface PromotionMetric {
  code: string;
  type: string;
  redemptions: number;
  discountGiven: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomersPeriod: number;
  repeatBuyersCount: number;
  repeatPurchaseRate: number;
}

export interface SalesTimeSeriesPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface ExportableOrderRow {
  orderNumber: string;
  date: string;
  customerEmail: string;
  status: string;
  subtotal: string;
  cost: string;
  profit: string;
  discount: string;
  tax: string;
  shipping: string;
  total: string;
}

export interface EcommerceReportsData {
  timeRange: '7d' | '30d' | '90d' | 'ytd' | 'all';
  startDateIso: string;
  financials: FinancialMetrics;
  orders: OrderMetrics;
  topProducts: TopProductMetric[];
  categories: CategoryMetric[];
  promotions: PromotionMetric[];
  customers: CustomerMetrics;
  salesTimeline: SalesTimeSeriesPoint[];
  exportableRows: ExportableOrderRow[];
}

export class ReportsService {
  /**
   * Compiles comprehensive financial, operational, and inventory performance reports.
   */
  async getReportsData(
    timeRange: '7d' | '30d' | '90d' | 'ytd' | 'all' = '30d'
  ): Promise<EcommerceReportsData> {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // 1. Fetch raw orders and line items
    const [allOrders, allItems, allProfiles, allProducts, allCategories, allCoupons, allReturns] =
      await Promise.all([
        safeQuery(() => db.select().from(orders).orderBy(desc(orders.createdAt)), 'report_orders'),
        safeQuery(() => db.select().from(orderItems), 'report_order_items'),
        safeQuery(() => db.select().from(profiles), 'report_profiles'),
        safeQuery(() => db.select().from(products), 'report_products'),
        safeQuery(() => db.select().from(categories), 'report_categories'),
        safeQuery(() => db.select().from(coupons), 'report_coupons'),
        safeQuery(() => db.select().from(returns), 'report_returns'),
      ]);

    // 2. Filter orders by selected time horizon
    const periodOrders = allOrders.filter(
      (o) => new Date(o.createdAt).getTime() >= startDate.getTime()
    );

    const nonCancelledOrders = periodOrders.filter((o) => o.status !== 'cancelled');
    const orderIdSet = new Set(periodOrders.map((o) => o.id));
    const nonCancelledOrderIdSet = new Set(nonCancelledOrders.map((o) => o.id));

    // 3. Compute Financial Totals
    const grossRevenue = nonCancelledOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount || '0'),
      0
    );
    const totalDiscounts = nonCancelledOrders.reduce(
      (sum, o) => sum + parseFloat(o.discountAmount || '0'),
      0
    );
    const taxCollected = nonCancelledOrders.reduce(
      (sum, o) => sum + parseFloat(o.taxAmount || '0'),
      0
    );
    const shippingCollected = nonCancelledOrders.reduce(
      (sum, o) => sum + parseFloat(o.shippingAmount || '0'),
      0
    );

    const periodReturns = allReturns.filter((r) => {
      const matchOrder = allOrders.find((o) => o.id === r.orderId);
      if (!matchOrder) return false;
      return new Date(matchOrder.createdAt).getTime() >= startDate.getTime();
    });

    const refundsIssued = periodReturns
      .filter((r: any) => r.status === 'refunded')
      .reduce((sum: number, r: any) => sum + parseFloat(r.refundAmount || '0'), 0);

    const netRevenue = Math.max(0, grossRevenue - refundsIssued);
    const averageOrderValue =
      nonCancelledOrders.length > 0 ? grossRevenue / nonCancelledOrders.length : 0;

    // 4. Order Metrics & Pipeline Status Breakdown
    const statusCounts: Record<string, number> = {};
    for (const o of periodOrders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const totalOrdersCount = periodOrders.length;
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0,
    }));

    const returnRate =
      totalOrdersCount > 0 ? Math.round((periodReturns.length / totalOrdersCount) * 100) : 0;

    // 5. Product Performance, Top Selling Items & Profit Margins
    const periodItems = allItems.filter((item) => nonCancelledOrderIdSet.has(item.orderId));
    const productStats: Record<string, { unitsSold: number; revenue: number; cost: number; profit: number; name: string }> = {};

    let totalCostOfGoodsSold = 0;

    for (const it of periodItems) {
      const pId = it.productId || 'custom';
      const itemPrice = parseFloat(it.price || '0');
      // Use snapshotted cost price from order line, fallback to 50% if unrecorded historically
      const itemCost =
        it.costPrice !== null && it.costPrice !== undefined
          ? parseFloat(it.costPrice)
          : itemPrice * 0.5;
      const qty = it.quantity || 1;
      const rev = itemPrice * qty;
      const cost = itemCost * qty;
      const profit = rev - cost;

      totalCostOfGoodsSold += cost;

      if (!productStats[pId]) {
        productStats[pId] = {
          name: it.name || 'Custom Item',
          unitsSold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      productStats[pId].unitsSold += qty;
      productStats[pId].revenue += rev;
      productStats[pId].cost += cost;
      productStats[pId].profit += profit;
    }

    const grossProfit = Math.max(0, netRevenue - totalCostOfGoodsSold);
    const profitMarginPercentage = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const topProducts: TopProductMetric[] = Object.entries(productStats)
      .map(([productId, stat]) => ({
        productId,
        name: stat.name,
        unitsSold: stat.unitsSold,
        revenue: stat.revenue,
        cost: stat.cost,
        profit: stat.profit,
        margin: stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // 6. Category Revenue Contribution
    const categoryStats: Record<string, { revenue: number; unitsSold: number }> = {};
    const productCategoryMap = new Map(allProducts.map((p) => [p.id, p.categoryId]));
    const categoryNameMap = new Map(allCategories.map((c) => [c.id, c.name]));

    for (const it of periodItems) {
      const catId = it.productId ? productCategoryMap.get(it.productId) : null;
      const catName = (catId ? categoryNameMap.get(catId) : null) || 'Uncategorized';

      if (!categoryStats[catName]) {
        categoryStats[catName] = { revenue: 0, unitsSold: 0 };
      }
      categoryStats[catName].unitsSold += it.quantity || 1;
      categoryStats[catName].revenue += parseFloat(it.price || '0') * (it.quantity || 1);
    }

    const totalCategoryRev = Object.values(categoryStats).reduce((acc, c) => acc + c.revenue, 0);
    const categoryMetrics: CategoryMetric[] = Object.entries(categoryStats)
      .map(([categoryName, stat]) => ({
        categoryName,
        revenue: stat.revenue,
        unitsSold: stat.unitsSold,
        sharePercentage:
          totalCategoryRev > 0 ? Math.round((stat.revenue / totalCategoryRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 7. Promotions & Coupon Redemptions
    const couponRedemptionCounts: Record<string, { redemptions: number; discountTotal: number }> =
      {};
    for (const o of nonCancelledOrders) {
      if (o.couponId) {
        if (!couponRedemptionCounts[o.couponId]) {
          couponRedemptionCounts[o.couponId] = { redemptions: 0, discountTotal: 0 };
        }
        couponRedemptionCounts[o.couponId].redemptions += 1;
        couponRedemptionCounts[o.couponId].discountTotal += parseFloat(o.discountAmount || '0');
      }
    }

    const promotionMetrics: PromotionMetric[] = allCoupons
      .map((c) => {
        const stats = couponRedemptionCounts[c.id] || {
          redemptions: c.usedCount || 0,
          discountTotal: 0,
        };
        return {
          code: c.code,
          type: c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`,
          redemptions: stats.redemptions,
          discountGiven: stats.discountTotal,
        };
      })
      .sort((a, b) => b.redemptions - a.redemptions);

    // 8. Customer Analytics
    const customersOnly = allProfiles.filter((p) => p.role === 'customer');
    const newCustomersPeriod = customersOnly.filter(
      (p) => new Date(p.createdAt).getTime() >= startDate.getTime()
    ).length;

    const buyerOrderCounts: Record<string, number> = {};
    for (const o of allOrders) {
      if (o.profileId) {
        buyerOrderCounts[o.profileId] = (buyerOrderCounts[o.profileId] || 0) + 1;
      }
    }

    const repeatBuyersCount = Object.values(buyerOrderCounts).filter((cnt) => cnt > 1).length;
    const totalBuyers = Object.keys(buyerOrderCounts).length;
    const repeatPurchaseRate =
      totalBuyers > 0 ? Math.round((repeatBuyersCount / totalBuyers) * 100) : 0;

    // 9. Sales Timeline Points (Daily Buckets)
    const dailyMap: Record<string, { sales: number; orders: number }> = {};
    for (const o of nonCancelledOrders) {
      const d = new Date(o.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { sales: 0, orders: 0 };
      }
      dailyMap[dateKey].sales += parseFloat(o.totalAmount || '0');
      dailyMap[dateKey].orders += 1;
    }

    const salesTimeline: SalesTimeSeriesPoint[] = Object.entries(dailyMap)
      .map(([date, val]) => ({
        date,
        sales: Math.round(val.sales),
        orders: val.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 10. Audit & Exportable Order Lines
    const orderCostMap = new Map<string, number>();
    for (const it of allItems) {
      if (it.orderId) {
        const itemPrice = parseFloat(it.price || '0');
        const itemCost =
          it.costPrice !== null && it.costPrice !== undefined
            ? parseFloat(it.costPrice)
            : itemPrice * 0.5;
        const qty = it.quantity || 1;
        const cur = orderCostMap.get(it.orderId) || 0;
        orderCostMap.set(it.orderId, cur + itemCost * qty);
      }
    }

    const exportableRows: ExportableOrderRow[] = periodOrders.map((o) => {
      const addr = (o.shippingAddress as Record<string, any>) || {};
      const orderCost = orderCostMap.get(o.id) || 0;
      const orderSubtotal = parseFloat(o.subtotal || '0');
      const orderProfit = Math.max(0, orderSubtotal - orderCost);

      return {
        orderNumber: o.orderNumber || o.id.slice(0, 8),
        date: new Date(o.createdAt).toISOString().split('T')[0],
        customerEmail: addr.email || 'guest@example.com',
        status: o.status,
        subtotal: o.subtotal,
        cost: orderCost.toFixed(2),
        profit: orderProfit.toFixed(2),
        discount: o.discountAmount,
        tax: o.taxAmount,
        shipping: o.shippingAmount,
        total: o.totalAmount,
      };
    });

    return {
      timeRange,
      startDateIso: startDate.toISOString(),
      financials: {
        grossRevenue,
        netRevenue,
        costOfGoodsSold: totalCostOfGoodsSold,
        grossProfit,
        profitMarginPercentage,
        totalDiscounts,
        taxCollected,
        shippingCollected,
        refundsIssued,
        averageOrderValue,
      },
      orders: {
        totalOrders: totalOrdersCount,
        completedOrders: statusCounts['delivered'] || 0,
        cancelledOrders: statusCounts['cancelled'] || 0,
        pendingOrders: statusCounts['pending'] || 0,
        returnRate,
        ordersByStatus,
      },
      topProducts,
      categories: categoryMetrics,
      promotions: promotionMetrics,
      customers: {
        totalCustomers: customersOnly.length,
        newCustomersPeriod,
        repeatBuyersCount,
        repeatPurchaseRate,
      },
      salesTimeline,
      exportableRows,
    };
  }
}

export const reportsService = new ReportsService();
export default reportsService;

