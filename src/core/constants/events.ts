export const EVENTS = {
  ORDER: {
    CREATED: 'order.created',
    UPDATED: 'order.updated',
    CANCELLED: 'order.cancelled',
    SHIPPED: 'order.shipped',
  },
  PRODUCT: {
    CREATED: 'product.created',
    UPDATED: 'product.updated',
    OUT_OF_STOCK: 'product.out_of_stock',
  },
  CUSTOMER: {
    REGISTERED: 'customer.registered',
    PROFILE_UPDATED: 'customer.profile_updated',
  },
  NOTIFICATION: {
    SEND_EMAIL: 'notification.send_email',
  },
} as const;
