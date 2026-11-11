import { type ShippingMethod, type CheckoutStep } from './checkout.types';

/**
 * Available shipping methods with carrier metadata.
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    carrier: 'India Post / Blue Dart',
    name: 'Standard Shipping',
    description: 'Delivered in 3-5 business days',
    price: 99.0,
    estimatedDays: 5,
  },
  {
    id: 'express',
    carrier: 'Blue Dart Express',
    name: 'Express Courier',
    description: 'Delivered in 1-2 business days',
    price: 199.0,
    estimatedDays: 2,
  },
  {
    id: 'overnight',
    carrier: 'DTDC Priority',
    name: 'Overnight Express',
    description: 'Next business day delivery',
    price: 499.0,
    estimatedDays: 1,
  },
];

/**
 * Payment types available at checkout.
 */
export const PAYMENT_TYPES = [
  {
    type: 'razorpay' as const,
    label: 'Online Payment (Razorpay)',
    description: 'UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking & Wallets',
    icon: 'CreditCard' as const,
  },
  {
    type: 'cod' as const,
    label: 'Cash on Delivery',
    description: 'Pay cash upon receiving your order',
    icon: 'Banknote' as const,
  },
];

/**
 * Step metadata for the checkout progress indicator.
 */
export const CHECKOUT_STEPS: { step: CheckoutStep; label: string; description: string }[] = [
  { step: 'address', label: 'Address', description: 'Shipping details' },
  { step: 'shipping', label: 'Shipping', description: 'Delivery method' },
  { step: 'review', label: 'Review', description: 'Order summary' },
  { step: 'payment', label: 'Payment', description: 'Payment method' },
  { step: 'confirmation', label: 'Confirmed', description: 'Order placed' },
];

/**
 * Returns the numeric index of a step for progress comparison.
 */
export function getStepIndex(step: CheckoutStep): number {
  return CHECKOUT_STEPS.findIndex((s) => s.step === step);
}
