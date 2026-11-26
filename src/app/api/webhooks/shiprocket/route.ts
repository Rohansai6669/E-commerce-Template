import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { eq, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Webhook handler for Shiprocket shipment & courier events.
 * Listens for tracking updates, AWB generation, out-for-delivery, and delivery events.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Shiprocket payloads typically contain order_id, current_status, awb, courier_name, etc.
    const orderId = body.order_id || body.channel_order_id;
    const awb = body.awb || body.awb_code;
    const currentStatus = (body.current_status || body.status || '').toUpperCase();
    const courierName = body.courier_name;

    if (!orderId && !awb) {
      return NextResponse.json(
        { error: 'Missing order_id or awb identifier in payload.' },
        { status: 400 }
      );
    }

    // Locate the matching order in our database
    const cleanNum = (orderId || '').trim().toUpperCase();
    const [matchedOrder] = await db
      .select()
      .from(orders)
      .where(
        or(
          sql`UPPER(${orders.orderNumber}) = ${cleanNum}`,
          sql`UPPER(${orders.shippingAddress}->>'orderNumber') = ${cleanNum}`,
          sql`${orders.shippingAddress}->'tracking'->>'awb' = ${awb}`
        )
      )
      .limit(1);

    if (!matchedOrder) {
      console.warn(`[Shiprocket Webhook] No matching order found for order_id: ${orderId}, awb: ${awb}`);
      return NextResponse.json({ received: true, matched: false });
    }

    // Map Shiprocket status to application order status enum
    let mappedStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null = null;

    if (
      currentStatus.includes('DELIVERED')
    ) {
      mappedStatus = 'delivered';
    } else if (
      currentStatus.includes('IN TRANSIT') ||
      currentStatus.includes('OUT FOR DELIVERY') ||
      currentStatus.includes('PICKED UP') ||
      currentStatus.includes('SHIPPED') ||
      currentStatus.includes('AWB ASSIGNED')
    ) {
      mappedStatus = 'shipped';
    } else if (
      currentStatus.includes('CANCELED') ||
      currentStatus.includes('CANCELLED') ||
      currentStatus.includes('RTO')
    ) {
      mappedStatus = 'cancelled';
    }

    // Preserve and merge existing tracking metadata inside shippingAddress JSONB
    const currentAddress = (matchedOrder.shippingAddress || {}) as Record<string, any>;
    const currentTracking = currentAddress.tracking || {};

    const rawActivities = body.scans || body.activities || body.shipment_track_activities || [];
    const formattedActivities = Array.isArray(rawActivities)
      ? rawActivities.map((s: any) => ({
          date: s.date || s.timestamp || new Date().toISOString(),
          status: s.status || currentStatus,
          activity: s.activity || s.status || currentStatus,
          location: s.location || '',
        }))
      : currentTracking.activities || [];

    const latestScan = formattedActivities[0] || {
      status: currentStatus,
      location: body.scans?.[0]?.location || body.location || '',
      activity: body.scans?.[0]?.activity || body.activity || currentStatus,
      timestamp: new Date().toISOString(),
    };

    const updatedTracking = {
      ...currentTracking,
      shippingProvider: 'shiprocket',
      awb: awb || currentTracking.awb,
      courierName: courierName || currentTracking.courierName,
      lastStatus: currentStatus,
      estimatedDelivery: body.edd || body.expected_date || body.expected_delivery_date || currentTracking.estimatedDelivery,
      activities: formattedActivities.length > 0 ? formattedActivities : currentTracking.activities || [],
      latestScan,
      updatedAt: new Date().toISOString(),
    };

    const updatePayload: Record<string, any> = {
      shippingAddress: {
        ...currentAddress,
        tracking: updatedTracking,
      },
      updatedAt: new Date(),
    };

    if (mappedStatus) {
      updatePayload.status = mappedStatus;
    }

    await db.update(orders).set(updatePayload).where(eq(orders.id, matchedOrder.id));

    // Revalidate paths for real-time storefront reflection
    revalidatePath('/track-order');
    revalidatePath('/admin/orders');
    revalidatePath(`/account/orders/${matchedOrder.id}`);

    return NextResponse.json({
      success: true,
      orderNumber: matchedOrder.orderNumber,
      updatedStatus: mappedStatus || matchedOrder.status,
    });
  } catch (err: any) {
    console.error('[Shiprocket Webhook Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
