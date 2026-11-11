'use client';

import * as React from 'react';
import { updateOrderStatusAction } from '@/app/actions/admin-actions';
import { DataTable, type ColumnDef, type FilterConfig } from '@/components/admin/data-table';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  createdAt: Date;
  totalAmount: string;
  status: string;
  items: any[];
  shippingAddress: any;
}

interface SuppliersItem {
  id: string;
  name: string;
  status: string;
}

interface SuppliersMappedItem {
  id: string;
  productId: string;
  supplierId: string;
}

interface OrdersListProps {
  initialOrders: OrderItem[];
  activeSuppliers: SuppliersItem[];
  mappedLinks: SuppliersMappedItem[];
}

export function OrdersList({
  initialOrders,
  activeSuppliers,
  mappedLinks,
}: OrdersListProps) {
  const [orders, setOrders] = React.useState(initialOrders);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleStatusChange = (orderId: string, currentStatus: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus as any);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus.toUpperCase()}.`);
      } else {
        toast.error(res.error || 'Failed to update order status.');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: currentStatus } : o))
        );
      }
    });
  };

  const getSubOrderId = (orderId: string, routeKey: string) => {
    let hash = 0;
    const str = orderId + routeKey;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `SO-${Math.abs(hash).toString(16).slice(0, 8).toUpperCase()}`;
  };

  const ordersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const splitOrdersCount = orders.filter((o) => o.items.length > 1).length;
  const dispatchedCount = orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length;

  // Transform data for table display
  const tableData = React.useMemo(() => {
    return orders.map((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });

      const orderNumber =
        order.shippingAddress?.orderNumber ||
        `LX${new Date(order.createdAt).getTime().toString().slice(-10)}`;

      const email = order.shippingAddress?.email || 'customer@example.com';
      const city = order.shippingAddress?.city || 'Mumbai';

      // Routing split groups
      const groups: Record<
        string,
        { items: any[]; supplierName: string; isPartner: boolean }
      > = {};

      order.items.forEach((item) => {
        const mapping = mappedLinks.find((link) => link.productId === item.productId);
        const boutique = mapping
          ? activeSuppliers.find((s) => s.id === mapping.supplierId)
          : null;

        const key = boutique ? `partner-${boutique.id}` : 'lexido';
        if (!groups[key]) {
          groups[key] = {
            items: [],
            supplierName: boutique ? boutique.name : 'LEXIDO Originals',
            isPartner: !!boutique,
          };
        }
        groups[key].items.push(item);
      });

      const subOrdersList = Object.entries(groups).map(([key, value]) => {
        const itemsCount = value.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = value.items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        );

        return {
          subOrderId: getSubOrderId(order.id, value.supplierName),
          routeTo: value.supplierName,
          isPartner: value.isPartner,
          itemsCount,
          subtotal,
        };
      });

      const isSplit = subOrdersList.length > 1;

      // Calculate snapshotted order cost & profit
      const orderCost = (order.items || []).reduce((sum: number, item: any) => {
        const itemPrice = parseFloat(item.price || '0');
        const itemCost =
          item.costPrice !== null && item.costPrice !== undefined
            ? parseFloat(item.costPrice)
            : itemPrice * 0.5;
        const qty = item.quantity || 1;
        return sum + itemCost * qty;
      }, 0);

      const orderRevenue = parseFloat(order.totalAmount || '0');
      const orderProfit = Math.max(0, orderRevenue - orderCost);
      const profitMargin = orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0;

      return {
        ...order,
        orderNumber,
        email,
        city,
        orderDate,
        subOrdersList,
        isSplit,
        totalAmountVal: orderRevenue,
        orderCost,
        orderProfit,
        profitMargin,
      };
    });
  }, [orders, mappedLinks, activeSuppliers]);

  // Filter Configuration
  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'status',
        label: 'Order Status',
        type: 'select',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'processing' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Refunded', value: 'refunded' },
        ],
      },
    ],
    []
  );

  // Column Definitions
  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Order Number & Customer',
        sortable: true,
        sortValue: (r) => r.orderNumber,
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-wide text-xs font-mono uppercase">
                {row.orderNumber}
              </span>
              {row.isSplit && (
                <span className="bg-slate-950 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm select-none">
                  SPLIT - {row.subOrdersList.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{row.email}</span>
              <span>·</span>
              <span>{row.city}</span>
              <span>·</span>
              <span className="font-mono text-[11px] text-slate-400">{row.orderDate}</span>
            </div>
          </div>
        ),
      },
      {
        header: 'Routing Split',
        sortable: false,
        cell: (row) => (
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            {row.subOrdersList.map((sub) => (
              <div
                key={sub.subOrderId}
                className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-[11px] font-mono">{sub.subOrderId}</span>
                  <span className="text-[10px] text-slate-500">{sub.routeTo}</span>
                </div>
                {sub.isPartner ? (
                  <span className="border border-slate-900 bg-white text-slate-950 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                    Partner
                  </span>
                ) : (
                  <span className="bg-slate-950 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                    Lexido
                  </span>
                )}
              </div>
            ))}
          </div>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (r) => r.status,
        cell: (row) => (
          <select
            value={row.status}
            disabled={isPending}
            onChange={(e) => handleStatusChange(row.id, row.status, e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 disabled:opacity-50 font-extrabold uppercase cursor-pointer text-[10px] tracking-wider h-8 transition"
          >
            <option value="pending">PENDING</option>
            <option value="processing">CONFIRMED</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
            <option value="refunded">REFUNDED</option>
          </select>
        ),
      },
      {
        header: 'Revenue & Profit',
        sortable: true,
        sortValue: (r) => r.totalAmountVal,
        className: 'text-right font-extrabold text-slate-900 text-xs',
        cell: (row) => (
          <div className="flex flex-col items-end">
            <span className="font-black text-slate-950 font-mono text-xs">
              {row.totalAmountVal.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              +{row.orderProfit.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}{' '}
              ({row.profitMargin.toFixed(0)}%)
            </span>
          </div>
        ),
      },
    ],
    [isPending]
  );

  const totalProfitSum = React.useMemo(() => {
    return tableData
      .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((acc, o) => acc + o.orderProfit, 0);
  }, [tableData]);

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans w-full">
      {/* Metric summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{ordersCount}</span>
        </div>
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Realized Profit</span>
          <span className="text-2xl font-black text-emerald-700 tracking-tight font-heading">
            {totalProfitSum.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Processing</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{pendingCount}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatched Consignments</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{dispatchedCount}</span>
        </div>
      </div>

      {/* Standardized DataTable Engine */}
      <DataTable
        columns={columns}
        data={tableData}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search orders by number, email, or city..."
        searchableKeys={(item) => [item.orderNumber, item.email, item.city]}
        getItemKey={(item) => item.id}
        bulkActions={(keys, selectedItems, clearSelection) => (
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              const newStatus = e.target.value;
              startTransition(async () => {
                let count = 0;
                for (const id of keys) {
                  const res = await updateOrderStatusAction(id, newStatus as any);
                  if (res.success) count++;
                }
                setOrders((prev) =>
                  prev.map((o) => (keys.includes(o.id) ? { ...o, status: newStatus } : o))
                );
                clearSelection();
                toast.success(`Updated ${count} orders to ${newStatus.toUpperCase()}`);
              });
            }}
            defaultValue=""
            disabled={isPending}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold h-8 px-3 rounded cursor-pointer"
          >
            <option value="" disabled>
              Bulk Update Status...
            </option>
            <option value="processing">Mark Confirmed</option>
            <option value="shipped">Mark Shipped</option>
            <option value="delivered">Mark Delivered</option>
            <option value="cancelled">Mark Cancelled</option>
          </select>
        )}
      />
    </div>
  );
}
export default OrdersList;
