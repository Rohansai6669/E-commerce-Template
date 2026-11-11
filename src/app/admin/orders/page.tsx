import * as React from 'react';
import { orderRepository } from '@/core/order/order.repository';
import { connection } from 'next/server';
import { OrdersList } from '@/components/admin/orders-list';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { eq } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';

interface OrderItem {
  id: string;
  createdAt: Date;
  totalAmount: string;
  status: string;
  items: any[];
  shippingAddress: any;
}

/**
 * Server Component displaying the Admin Orders Manager.
 */
export default async function AdminOrdersManager() {
  await connection();

  const [ordersRaw, activeSuppliers, mappedLinks] = await Promise.all([
    orderRepository.getAllOrders() as Promise<OrderItem[]>,
    safeQuery(() => db.select().from(suppliers).where(eq(suppliers.status, 'active')), 'active_suppliers'),
    safeQuery(() => db.select().from(supplierProducts), 'supplier_products'),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 uppercase font-heading">Order Routing Logs</h2>
        <p className="text-sm text-slate-500 font-sans">
          Track, group, and route order consignments to suppliers and internal logistics.
        </p>
      </div>

      <div className="bg-white">
        <OrdersList
          initialOrders={ordersRaw}
          activeSuppliers={activeSuppliers}
          mappedLinks={mappedLinks}
        />
      </div>
    </div>
  );
}
