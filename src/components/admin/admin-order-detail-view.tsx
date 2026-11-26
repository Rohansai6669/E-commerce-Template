'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Truck,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Package,
  Layers,
  ArrowUpRight,
  Barcode,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateOrderStatusAction, shipOrderWithShiprocketAction } from '@/app/actions/admin-actions';
import { BarcodeScannerModal } from './barcode-scanner-modal';

export interface AdminOrderDetailViewProps {
  order: any;
  activeSuppliers?: { id: string; name: string; status: string }[];
  mappedLinks?: { id: string; productId: string; supplierId: string }[];
  onStatusChange?: (orderId: string, currentStatus: string, newStatus: string) => void;
  onShiprocketDispatch?: (orderId: string) => void;
  isShipping?: boolean;
  isPending?: boolean;
  onClose?: () => void;
  isDrawer?: boolean;
}

export function AdminOrderDetailView({
  order,
  activeSuppliers = [],
  mappedLinks = [],
  onStatusChange,
  onShiprocketDispatch,
  isShipping: externalIsShipping,
  isPending: externalIsPending,
  onClose,
  isDrawer = false,
}: AdminOrderDetailViewProps) {
  const [internalStatus, setInternalStatus] = React.useState<string>(order.status || 'pending');
  const [internalIsPending, startTransition] = React.useTransition();
  const [internalIsShipping, setInternalIsShipping] = React.useState(false);
  const [isCopiedAwb, setIsCopiedAwb] = React.useState(false);
  const [isCopiedOrderNum, setIsCopiedOrderNum] = React.useState(false);

  // Barcode Scanning & Verification State
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [verifiedItemIds, setVerifiedItemIds] = React.useState<Record<string, boolean>>({});
  const [inlineScanCode, setInlineScanCode] = React.useState('');

  React.useEffect(() => {
    setInternalStatus(order.status || 'pending');
  }, [order.status]);

  const isPending = externalIsPending !== undefined ? externalIsPending : internalIsPending;
  const isShipping = externalIsShipping !== undefined ? externalIsShipping : internalIsShipping;

  const orderNumber =
    order.orderNumber ||
    order.shippingAddress?.orderNumber ||
    `LX${new Date(order.createdAt).getTime().toString().slice(-10)}`;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const address = order.shippingAddress || {};
  const customerName =
    [address.firstName, address.lastName].filter(Boolean).join(' ') ||
    address.name ||
    'Customer';
  const email = address.email || order.profile?.email || 'customer@example.com';
  const phone = address.phone || 'Not provided';
  const tracking = address.tracking;

  const lat = address.latitude ?? address.coordinates?.lat;
  const lng = address.longitude ?? address.coordinates?.lng;
  const hasGps = lat !== undefined && lat !== null && lng !== undefined && lng !== null;

  // Sub-order routing groups
  const groups: Record<string, { items: any[]; supplierName: string; isPartner: boolean }> = {};
  const orderItemsList = order.items || [];

  orderItemsList.forEach((item: any) => {
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

  const subOrders = Object.entries(groups).map(([key, value]) => {
    let hash = 0;
    const str = order.id + value.supplierName;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const subOrderId = `SO-${Math.abs(hash).toString(16).slice(0, 8).toUpperCase()}`;
    return {
      subOrderId,
      routeTo: value.supplierName,
      isPartner: value.isPartner,
      items: value.items,
    };
  });

  // Calculate order financial metrics
  const orderCost = orderItemsList.reduce((sum: number, item: any) => {
    const itemPrice = parseFloat(item.price || '0');
    const itemCost =
      item.costPrice !== null && item.costPrice !== undefined
        ? parseFloat(item.costPrice)
        : itemPrice * 0.5;
    const qty = item.quantity || 1;
    return sum + itemCost * qty;
  }, 0);

  const subtotal = parseFloat(order.subtotal || order.totalAmount || '0');
  const totalRevenue = parseFloat(order.totalAmount || '0');
  const shippingAmount = parseFloat(order.shippingAmount || '0');
  const discountAmount = parseFloat(order.discountAmount || '0');
  const taxAmount = parseFloat(order.taxAmount || '0');
  const orderProfit = Math.max(0, totalRevenue - orderCost);
  const profitMargin = totalRevenue > 0 ? (orderProfit / totalRevenue) * 100 : 0;

  // Barcode Verification Matching Logic
  const handleBarcodeScanned = (scannedValue: string) => {
    const clean = scannedValue.trim().toLowerCase();
    if (!clean) return;

    // Check if matches any item SKU, barcode, id, or name
    const matchedItem = orderItemsList.find((item: any) => {
      const sku = (item.sku || '').toLowerCase();
      const barcode = (item.variant?.barcode || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const variantId = (item.variantId || '').toLowerCase();
      const name = (item.name || '').toLowerCase();

      return (
        sku === clean ||
        barcode === clean ||
        id === clean ||
        variantId === clean ||
        sku.includes(clean) ||
        clean.includes(sku) ||
        name.includes(clean)
      );
    });

    if (matchedItem) {
      setVerifiedItemIds((prev) => ({
        ...prev,
        [matchedItem.id]: true,
      }));
      toast.success(`Verified: ${matchedItem.name}`);
    } else {
      toast.error(`Barcode "${scannedValue}" does not match any item in this order.`);
    }
  };

  const handleInlineScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inlineScanCode.trim()) {
      handleBarcodeScanned(inlineScanCode);
      setInlineScanCode('');
    }
  };

  const toggleItemVerified = (itemId: string) => {
    setVerifiedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const verifyAllItems = () => {
    const all: Record<string, boolean> = {};
    orderItemsList.forEach((item: any) => {
      all[item.id] = true;
    });
    setVerifiedItemIds(all);
    toast.success('All items marked as verified for packaging.');
  };

  const verifiedCount = Object.values(verifiedItemIds).filter(Boolean).length;
  const isAllVerified = orderItemsList.length > 0 && verifiedCount >= orderItemsList.length;

  const handleCopy = (text: string, type: 'awb' | 'orderNum') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'awb') {
        setIsCopiedAwb(true);
        setTimeout(() => setIsCopiedAwb(false), 2000);
      } else {
        setIsCopiedOrderNum(true);
        setTimeout(() => setIsCopiedOrderNum(false), 2000);
      }
      toast.success('Copied to clipboard');
    }
  };

  const handleStatusChangeInternal = (newStatus: string) => {
    const prevStatus = internalStatus;
    setInternalStatus(newStatus);

    if (onStatusChange) {
      onStatusChange(order.id, prevStatus, newStatus);
      return;
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, newStatus as any);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      } else {
        toast.error(res.error || 'Failed to update order status');
        setInternalStatus(prevStatus);
      }
    });
  };

  const handleShipInternal = () => {
    if (onShiprocketDispatch) {
      onShiprocketDispatch(order.id);
      return;
    }

    setInternalIsShipping(true);
    startTransition(async () => {
      const res = await shipOrderWithShiprocketAction(order.id);
      setInternalIsShipping(false);
      if (res.success) {
        toast.success(`Dispatched via ${res.courierName}! AWB: ${res.awbCode}`);
        setInternalStatus('shipped');
      } else {
        toast.error(res.error || 'Failed to dispatch via Shiprocket');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans">
      {/* 1. TOP HEADER CARD */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-extrabold text-slate-950 text-base sm:text-lg font-mono tracking-wide">
              {orderNumber}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(orderNumber, 'orderNum')}
              className="text-slate-400 hover:text-slate-800 transition p-1 rounded hover:bg-slate-200 cursor-pointer"
              title="Copy Order Number"
            >
              {isCopiedOrderNum ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {subOrders.length > 1 && (
              <span className="bg-slate-950 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded select-none">
                SPLIT CONSIGNMENT ({subOrders.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Placed on {orderDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Status</span>
            <select
              value={internalStatus}
              disabled={isPending}
              onChange={(e) => handleStatusChangeInternal(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded font-black text-xs uppercase tracking-wider text-slate-900 cursor-pointer hover:border-slate-950 transition focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:opacity-50"
            >
              <option value="pending">PENDING</option>
              <option value="processing">CONFIRMED</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="cancelled">CANCELLED</option>
              <option value="refunded">REFUNDED</option>
            </select>
          </div>

          {isDrawer && (
            <Link
              href={`/admin/orders/${order.id}`}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded text-slate-700 transition"
              title="Open full page view"
              target="_blank"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. ORDERED PRODUCTS LIST - PLACED ON TOP AS REQUESTED */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
        {/* Products Header with Barcode Scanner Actions */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-900" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
              Ordered Products ({orderItemsList.length})
            </h4>
            {orderItemsList.length > 0 && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  isAllVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {verifiedCount}/{orderItemsList.length} Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Camera Barcode Scanner trigger button */}
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded text-[11px] font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Camera Barcode Scanner"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Barcode Scanner</span>
            </button>

            {/* Mark all verified shortcut */}
            {!isAllVerified && orderItemsList.length > 0 && (
              <button
                type="button"
                onClick={verifyAllItems}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-800 text-slate-800 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Verify All
              </button>
            )}
          </div>
        </div>

        {/* Quick Barcode Scanner Input Bar */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <form onSubmit={handleInlineScanSubmit} className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inlineScanCode}
                onChange={(e) => setInlineScanCode(e.target.value)}
                placeholder="Scan or enter SKU / barcode to verify item..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 uppercase"
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={!inlineScanCode.trim()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 cursor-pointer"
            >
              Scan
            </button>
          </form>
          <span className="text-[10px] text-slate-400 text-center sm:text-right font-mono">
            Supports Camera & Handheld Laser Scanner
          </span>
        </div>

        {/* Products Items List */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {orderItemsList.map((item: any, idx: number) => {
            const price = parseFloat(item.price || '0');
            const qty = item.quantity || 1;
            const lineTotal = price * qty;
            const cost = item.costPrice ? parseFloat(item.costPrice) : price * 0.5;
            const lineProfit = Math.max(0, lineTotal - cost * qty);
            const isVerified = Boolean(verifiedItemIds[item.id]);
            const sku = item.sku || 'N/A';
            const barcode = item.variant?.barcode || sku;

            return (
              <div
                key={item.id || idx}
                className={`p-4 flex items-center justify-between gap-4 text-xs transition-colors ${
                  isVerified ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Verified Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleItemVerified(item.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition border cursor-pointer shrink-0 ${
                      isVerified
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-500 bg-white text-transparent'
                    }`}
                    title={isVerified ? 'Verified: Click to uncheck' : 'Click to mark verified'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="w-14 h-14 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                      {isVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Packed</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Awaiting Scan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono mt-0.5">
                      <span className="text-slate-600">SKU: <strong className="text-slate-900">{sku}</strong></span>
                      {barcode && barcode !== sku && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600">Barcode: <strong className="text-slate-900">{barcode}</strong></span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                      <span>Qty: <strong>{qty}</strong></span>
                      <span>·</span>
                      <span>
                        Unit: {price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="font-black text-slate-950 font-mono text-xs">
                    {lineTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    +{lineProfit.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SHIPROCKET LOGISTICS FULFILLMENT CARD */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-heading">
              Shiprocket Logistics & Delivery
            </h3>
          </div>
          {tracking?.awb && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold">
              {tracking.lastStatus || 'Dispatched'}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {tracking?.awb ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">
                  {tracking.courierName || 'Shiprocket Partner'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  AWB: {tracking.awb}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(tracking.awb, 'awb')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {isCopiedAwb ? 'Copied!' : 'Copy AWB'}
                </button>
              </div>

              {tracking.latestScan?.activity && (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Latest Scan:</span> {tracking.latestScan.activity}{' '}
                  {tracking.latestScan.location ? `(${tracking.latestScan.location})` : ''}
                </p>
              )}

              {tracking.estimatedDelivery && (
                <p className="text-xs text-slate-900 font-semibold">
                  Estimated Delivery: {tracking.estimatedDelivery}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-800">Ready for Consignment Dispatch</span>
              <p className="text-xs text-slate-500">
                Generate an AWB and book automated pickup with Shiprocket for this order.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {tracking?.trackingUrl && (
              <a
                href={tracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-900 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Live Carrier Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {!tracking?.awb && (
              <button
                type="button"
                onClick={handleShipInternal}
                disabled={isPending || isShipping || internalStatus === 'cancelled' || internalStatus === 'refunded'}
                className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>{isShipping ? 'Generating AWB...' : 'Ship with Shiprocket'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. TWO COLUMN GRID: CUSTOMER DESTINATION & FINANCIALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer & Shipping Address */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Delivery Destination
            </h4>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-700">
            <span className="font-extrabold text-slate-900 text-sm">{customerName}</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-blue-600 hover:underline">
                {email}
              </a>
            </div>
            {phone && phone !== 'Not provided' && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-blue-600 hover:underline">
                  {phone}
                </a>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5 text-slate-600">
              <span>{address.addressLine1 || address.street || 'Address Line 1'}</span>
              {address.addressLine2 && <span>{address.addressLine2}</span>}
              <span className="font-medium text-slate-900">
                {[address.city, address.state, address.postalCode || address.pincode].filter(Boolean).join(', ')}
              </span>
              <span>{address.country || 'India'}</span>
            </div>

            {hasGps && (
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>GPS: {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Financial & Payment Summary */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Financial Breakdown
            </h4>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-slate-900">
                {subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-mono font-medium text-slate-900">
                {shippingAmount === 0
                  ? 'FREE'
                  : shippingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-rose-600">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">
                  -{discountAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Taxes (GST):</span>
                <span className="font-mono font-medium text-slate-900">
                  {taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2.5 mt-1 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-950 uppercase text-xs">Total Amount:</span>
              <span className="font-black text-slate-950 font-mono text-base">
                {totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded p-2.5 mt-1 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Realized Profit Snapshot</span>
                <span className="font-mono text-emerald-700 text-[11px]">
                  Estimated Cost: {orderCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="font-black font-mono text-emerald-700 text-sm">
                +{orderProfit.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}{' '}
                ({profitMargin.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONSIGNMENT ROUTING GROUPS */}
      {subOrders.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Consignment & Fulfillment Routing ({subOrders.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subOrders.map((sub) => (
              <div
                key={sub.subOrderId}
                className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{sub.subOrderId}</span>
                  {sub.isPartner ? (
                    <span className="bg-white border border-slate-900 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      Partner Boutique
                    </span>
                  ) : (
                    <span className="bg-slate-950 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                      LEXIDO Warehouse
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Routing to: <strong className="text-slate-900">{sub.routeTo}</strong></span>
                  <span>{sub.items.length} item{sub.items.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleBarcodeScanned}
        title="Packing Barcode Scanner"
        description={`Scan product barcodes or SKUs to verify all ${orderItemsList.length} items in Order ${orderNumber}.`}
        placeholder="Scan SKU or item barcode..."
      />
    </div>
  );
}
export default AdminOrderDetailView;
