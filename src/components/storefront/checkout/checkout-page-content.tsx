'use client';

import * as React from 'react';
import { useCart } from '@/components/commerce/cart-context';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Heading, Text } from '@/components/ui/typography';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { CheckoutProgress } from './checkout-progress';
import { AddressForm } from './address-form';
import { ShippingMethodSelector } from './shipping-method';
import { ReviewOrder } from './review-order';
import { PaymentMethodForm } from './payment-method';
import { OrderConfirmation } from './order-confirmation';
import { type CheckoutState, type CheckoutAction, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { type CustomerAddress } from '@/core/address/address.types';
import { checkoutService } from '@/core/checkout/checkout.service';
import { type PlacedOrder } from '@/core/order/order.types';
import { placeOrderAction } from '@/app/actions/order';
import { createRazorpayOrderAction, verifyAndPlaceRazorpayOrderAction } from '@/app/actions/razorpay';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Dynamically loads the official Razorpay Checkout SDK script.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initial checkout state — each section isolated.
 */
const initialState: CheckoutState = {
  step: 'address',
  address: null,
  shippingMethod: null,
  paymentMethod: null,
  orderNotes: '',
};

/**
 * Checkout reducer managing step transitions and section data.
 */
function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'PREFILL_ADDRESS':
      return { ...state, address: action.address };
    case 'SET_ADDRESS':
      return { ...state, address: action.address, step: 'shipping' };
    case 'SET_SHIPPING_METHOD':
      return { ...state, shippingMethod: action.method, step: 'review' };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.method };
    case 'SET_ORDER_NOTES':
      return { ...state, orderNotes: action.notes };
    case 'GO_TO_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export interface CheckoutPageContentProps {
  user?: { id: string; email: string } | null;
  initialProfile?: { fullName?: string | null; phone?: string | null } | null;
  initialAddresses?: CustomerAddress[];
}

/**
 * Multi-step checkout page coordinator.
 */
export function CheckoutPageContent({
  user,
  initialProfile,
  initialAddresses = [],
}: CheckoutPageContentProps = {}) {
  const { items, coupon, applyCoupon, removeCoupon, clearCart, isHydrated } = useCart();
  const [state, dispatch] = React.useReducer(checkoutReducer, initialState);
  const [savedAddresses, setSavedAddresses] = React.useState<CustomerAddress[]>(initialAddresses);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState<PlacedOrder | null>(null);

  // Pre-fill default saved address if present and no address selected yet
  React.useEffect(() => {
    if (!state.address && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        dispatch({
          type: 'PREFILL_ADDRESS',
          address: {
            firstName: defaultAddr.firstName,
            lastName: defaultAddr.lastName,
            email: user?.email || '',
            phone: defaultAddr.phone,
            addressLine1: defaultAddr.addressLine1,
            addressLine2: defaultAddr.addressLine2 || '',
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country,
          },
        });
      }
    }
  }, [savedAddresses, user, state.address]);

  // Compute totals independently when we have a shipping method
  const totals: CheckoutTotals | null = React.useMemo(() => {
    if (!state.shippingMethod || items.length === 0) return null;
    return checkoutService.calculateOrderTotals(items, state.shippingMethod, coupon);
  }, [items, state.shippingMethod, coupon]);

  // Handle Razorpay Online Payment Checkout
  const handleRazorpayCheckout = React.useCallback(async () => {
    if (!state.address || !state.shippingMethod) return;

    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay payment SDK. Please check your network connection.');
        setIsProcessing(false);
        return;
      }

      const rzpRes = await createRazorpayOrderAction({
        items,
        shippingMethod: state.shippingMethod,
        coupon,
      });

      if (!rzpRes.success || !rzpRes.razorpayOrderId) {
        toast.error(rzpRes.error || 'Failed to initiate Razorpay checkout order.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: rzpRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpRes.amount,
        currency: rzpRes.currency || 'INR',
        name: 'Store Checkout',
        description: `Order Payment (${items.length} items)`,
        order_id: rzpRes.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await verifyAndPlaceRazorpayOrderAction({
              items,
              address: state.address!,
              shippingMethod: state.shippingMethod!,
              coupon,
              orderNotes: state.orderNotes,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success && verifyRes.order) {
              setPlacedOrder(verifyRes.order);
              dispatch({ type: 'GO_TO_STEP', step: 'confirmation' });
              clearCart();
              toast.success('Payment verified & order placed successfully!');
            } else {
              toast.error(verifyRes.error || 'Payment verification failed.');
            }
          } catch (err) {
            toast.error('An error occurred while confirming your order. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${state.address.firstName} ${state.address.lastName}`.trim(),
          email: state.address.email,
          contact: state.address.phone,
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment window was closed. You can retry or choose Cash on Delivery.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        const reason = resp.error?.description || resp.error?.reason || 'Payment failed. Please try again.';
        toast.error(`Payment Failed: ${reason}`, { duration: 7000 });
      });
      rzp.open();
    } catch (err: any) {
      toast.error('Payment checkout failed: ' + (err?.message || 'Unknown error'));
      setIsProcessing(false);
    }
  }, [items, state.address, state.shippingMethod, state.orderNotes, coupon, clearCart]);

  // Handle Cash on Delivery (COD) Checkout
  const handleCodCheckout = React.useCallback(async () => {
    if (!state.address || !state.shippingMethod) return;

    setIsProcessing(true);
    try {
      const result = await placeOrderAction({
        items,
        address: state.address,
        shippingMethod: state.shippingMethod,
        paymentMethod: { type: 'cod' },
        coupon,
        orderNotes: state.orderNotes,
      });

      if (result.success && result.order) {
        setPlacedOrder(result.order);
        dispatch({ type: 'GO_TO_STEP', step: 'confirmation' });
        clearCart();
        toast.success('Order placed successfully with Cash on Delivery!');
      } else {
        toast.error(result.error ?? 'Failed to place order.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [items, state.address, state.shippingMethod, state.orderNotes, coupon, clearCart]);

  if (!isHydrated) {
    return (
      <Container className="py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Container>
    );
  }

  // Empty cart guard (unless on confirmation)
  if (items.length === 0 && state.step !== 'confirmation') {
    return (
      <Container className="py-16 max-w-xl text-center">
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart before proceeding to checkout."
          icon="ShoppingBag"
        >
          <Button asChild className="mt-4 font-semibold text-xs cursor-pointer">
            <Link href="/products">Browse Products</Link>
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-3xl">
      <Stack gap="8">
        {/* Header */}
        <div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Checkout
          </Heading>
          <Text className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Complete your purchase securely.
          </Text>
        </div>

        {/* Progress */}
        <CheckoutProgress
          currentStep={state.step}
          onStepClick={(step) => {
            // Only allow navigating back to completed steps
            dispatch({ type: 'GO_TO_STEP', step });
          }}
        />

        {/* Step content */}
        {state.step === 'address' && (
          <AddressForm
            defaultValues={state.address}
            savedAddresses={savedAddresses}
            user={user}
            profile={initialProfile}
            onSubmit={(address) => dispatch({ type: 'SET_ADDRESS', address })}
            onAddressSaved={(newAddr) => {
              setSavedAddresses((prev) => [newAddr, ...prev]);
            }}
          />
        )}

        {state.step === 'shipping' && (
          <ShippingMethodSelector
            defaultValue={state.shippingMethod}
            onSubmit={(method) => dispatch({ type: 'SET_SHIPPING_METHOD', method })}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'address' })}
          />
        )}

        {state.step === 'review' && state.address && state.shippingMethod && totals && (
          <ReviewOrder
            items={items}
            address={state.address}
            shippingMethod={state.shippingMethod}
            coupon={coupon}
            totals={totals}
            orderNotes={state.orderNotes}
            onOrderNotesChange={(notes) => dispatch({ type: 'SET_ORDER_NOTES', notes })}
            onSubmit={() => dispatch({ type: 'GO_TO_STEP', step: 'payment' })}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'shipping' })}
            onEditAddress={() => dispatch({ type: 'GO_TO_STEP', step: 'address' })}
            onEditShipping={() => dispatch({ type: 'GO_TO_STEP', step: 'shipping' })}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        )}

        {state.step === 'payment' && (
          <PaymentMethodForm
            defaultValue={state.paymentMethod}
            totals={totals}
            coupon={coupon}
            items={items}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
            onSubmit={(method) => {
              dispatch({ type: 'SET_PAYMENT_METHOD', method });
              if (method.type === 'razorpay' || method.type === 'card') {
                handleRazorpayCheckout();
              } else {
                handleCodCheckout();
              }
            }}
            onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'review' })}
            isProcessing={isProcessing}
          />
        )}

        {state.step === 'confirmation' && placedOrder && (
          <OrderConfirmation order={placedOrder} />
        )}
      </Stack>
    </Container>
  );
}
export default CheckoutPageContent;
