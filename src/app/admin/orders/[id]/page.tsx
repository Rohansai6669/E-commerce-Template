import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ArrowLeft, Printer } from 'lucide-react';
import { orderRepository } from '@/core/order/order.repository';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { eq } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';
import { AdminOrderDetailView } from '@/components/admin/admin-order-detail-view';

export const metadata = {
  title: 'Order Details | Admin Console',
  description: 'Detailed consignment and routing records for customer orders.',
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await connection();
  const { id } = await params;

  const [order, activeSuppliers, mappedLinks] = await Promise.all([
    orderRepository.getOrderWithDetailsForAdmin(id),
    safeQuery(() => db.select().from(suppliers).where(eq(suppliers.status, 'active')), 'active_suppliers'),
    safeQuery(() => db.select().from(supplierProducts), 'supplier_products'),
  ]);

  if (!order) {
    notFound();
  }

  const orderNumber =
    order.orderNumber ||
    (order.shippingAddress as any)?.orderNumber ||
    `LX${new Date(order.createdAt).getTime().toString().slice(-10)}`;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-16 max-w-5xl">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <Link href="/admin/orders" className="hover:text-slate-900 font-bold transition">
              Orders
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-800">{orderNumber}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase font-heading">
            Order Record
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/orders"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-950 text-slate-800 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      {/* Main Order Detail Content */}
      <AdminOrderDetailView
        order={order}
        activeSuppliers={activeSuppliers}
        mappedLinks={mappedLinks}
        isDrawer={false}
      />
    </div>
  );
}
