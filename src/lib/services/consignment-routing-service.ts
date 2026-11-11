import { db } from '@/lib/db';
import { supplierOrders, supplierOrderItems } from '@/lib/db/schema/marketplace/supplier-orders';
import { CandidateSupplierScore } from './supplier-routing-service';
import { eq, and } from 'drizzle-orm';

export interface ConsignmentItemPlan {
  orderItemId: string;
  variantId: string;
  quantity: number;
  unitSellingPrice: number;
  grossAmount: number;
  discountAmount: number;
  shippingAmount: number;
  selectedSupplier: CandidateSupplierScore;
}

export class ConsignmentRoutingService {
  /**
   * Splits an order's routed line items into distinct supplier_orders consignments
   * with complete financial snapshots and DB-level idempotency handling.
   */
  async createConsignmentsForOrder(
    orderId: string,
    itemPlans: ConsignmentItemPlan[],
    client: any = db
  ) {
    // 1. Group items by supplierId
    const supplierGroups = new Map<string, ConsignmentItemPlan[]>();

    for (const plan of itemPlans) {
      const supId = plan.selectedSupplier.supplierId;
      if (!supplierGroups.has(supId)) {
        supplierGroups.set(supId, []);
      }
      supplierGroups.get(supId)!.push(plan);
    }

    const createdConsignments = [];

    for (const [supplierId, items] of supplierGroups.entries()) {
      let subtotal = 0;
      let taxAmount = 0;
      let shippingAmount = 0;
      let discountAmount = 0;
      let totalAmount = 0;

      for (const item of items) {
        subtotal += item.grossAmount;
        discountAmount += item.discountAmount;
        shippingAmount += item.shippingAmount;
      }

      totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;

      // 2. Insert supplier_order with DB-first ON CONFLICT handling
      let [supplierOrder] = await client
        .insert(supplierOrders)
        .values({
          orderId,
          supplierId,
          status: 'pending',
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
        })
        .onConflictDoNothing()
        .returning();

      // Retrieval fallback if record already existed
      if (!supplierOrder) {
        supplierOrder = await client.query.supplierOrders.findFirst({
          where: and(
            eq(supplierOrders.orderId, orderId),
            eq(supplierOrders.supplierId, supplierId)
          ),
        });
      }

      if (!supplierOrder) {
        throw new Error(`CONSIGNMENT_FAILED: Unable to create or retrieve supplier order for order ${orderId} and supplier ${supplierId}`);
      }

      // 3. Create supplier_order_items with complete financial snapshots
      const createdItems = [];

      for (const item of items) {
        const defaultCommissionRate = 15.0; // 15% platform commission snapshot
        const commissionAmount = (item.grossAmount * defaultCommissionRate) / 100;
        const platformFee = 0.0;
        const paymentGatewayFee = 0.0;
        const itemTax = 0.0;
        const netPayout = item.grossAmount - commissionAmount - platformFee - paymentGatewayFee;

        let [consignmentItem] = await client
          .insert(supplierOrderItems)
          .values({
            supplierOrderId: supplierOrder.id,
            orderItemId: item.orderItemId,
            supplierProductVariantId: item.selectedSupplier.supplierProductVariantId,
            quantity: item.quantity,
            price: item.unitSellingPrice.toFixed(2),
            unitCostPrice: item.selectedSupplier.costPrice.toFixed(2),
            unitSellingPrice: item.unitSellingPrice.toFixed(2),
            grossAmount: item.grossAmount.toFixed(2),
            discountAmount: item.discountAmount.toFixed(2),
            shippingAmount: item.shippingAmount.toFixed(2),
            commissionRate: defaultCommissionRate.toFixed(2),
            commissionAmount: commissionAmount.toFixed(2),
            platformFee: platformFee.toFixed(2),
            paymentGatewayFee: paymentGatewayFee.toFixed(2),
            taxAmount: itemTax.toFixed(2),
            netPayout: netPayout.toFixed(2),
          })
          .onConflictDoNothing()
          .returning();

        if (!consignmentItem) {
          consignmentItem = await client.query.supplierOrderItems.findFirst({
            where: and(
              eq(supplierOrderItems.supplierOrderId, supplierOrder.id),
              eq(supplierOrderItems.orderItemId, item.orderItemId)
            ),
          });
        }

        createdItems.push(consignmentItem);
      }

      createdConsignments.push({
        supplierOrder,
        items: createdItems,
      });
    }

    return createdConsignments;
  }
}

export const consignmentRoutingService = new ConsignmentRoutingService();
