import { type PlacedOrder, type CreateOrderParams } from './order.types';

/**
 * Maps create-order parameters into a PlacedOrder view model for confirmation display.
 */
export class OrderMapper {
  /**
   * Converts CreateOrderParams + database result into a PlacedOrder view model.
   */
  static toPlacedOrder(
    params: CreateOrderParams,
    dbResult: { id: string; orderNumber: string }
  ): PlacedOrder {
    const now = new Date();
    const deliveryDate = new Date(now);
    deliveryDate.setDate(deliveryDate.getDate() + params.shippingMethod.estimatedDays);

    return {
      id: dbResult.id,
      orderNumber: dbResult.orderNumber,
      status: 'pending',
      items: params.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
      })),
      address: params.address,
      shippingMethod: params.shippingMethod,
      paymentMethod: params.paymentMethod,
      subtotal: params.subtotal,
      discount: params.discount,
      shipping: params.shipping,
      tax: params.tax,
      total: params.total,
      couponCode: params.couponCode,
      orderNotes: params.orderNotes,
      placedAt: now.toISOString(),
      estimatedDelivery: deliveryDate.toISOString(),
    };
  }
}
export default OrderMapper;
