'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/commerce/cart-context';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { CheckoutProgress } from './checkout-progress';
import { AddressForm } from './address-form';
import { ShippingMethodSelector } from './shipping-method';
import { ReviewOrder } from './review-order';
import { PaymentMethodForm } from './payment-method';
import { OrderConfirmation } from './order-confirmation';
import { CheckoutOrderSummary } from './checkout-order-summary';
import { type CheckoutState, type CheckoutAction, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { type CustomerAddress } from '@/core/address/address.types';
import { checkoutService } from '@/core/checkout/checkout.service';
import { type PlacedOrder } from '@/core/order/order.types';
import { type LogisticsConfig } from '@/lib/shipping/logistics-manager';
import { placeOrderAction } from '@/app/actions/order';
import { createRazorpayOrderAction, verifyAndPlaceRazorpayOrderAction } from '@/app/actions/razorpay';
import { toast } from 'sonner';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { cn } from '@/core/utils/cn';

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
  initialLogisticsConfig?: LogisticsConfig;
}

/**
 * Multi-step checkout page coordinator.
 * Features a full-width responsive 2-column layout on desktop with a sticky order summary,
 * and a collapsible Shopify-style accordion on mobile devices.
 */
export function CheckoutPageContent({
  user,
  initialProfile,
  initialAddresses = [],
  initialLogisticsConfig,
}: CheckoutPageContentProps = {}) {
  const { items, coupon, applyCoupon, removeCoupon, clearCart, isHydrated } = useCart();
  const [state, dispatch] = React.useReducer(checkoutReducer, initialState);
  const [savedAddresses, setSavedAddresses] = React.useState<CustomerAddress[]>(initialAddresses);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState<PlacedOrder | null>(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = React.useState(false);

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

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  // Compute dynamic shipping methods based on subtotal and admin logistics settings
  const availableShippingMethods = React.useMemo(() => {
    return checkoutService.getDynamicShippingMethods(subtotal, initialLogisticsConfig);
  }, [subtotal, initialLogisticsConfig]);

  // Compute active shipping method ensuring price reflects latest thresholds
  const activeShippingMethod = React.useMemo(() => {
    if (!state.shippingMethod) return availableShippingMethods[0];
    const matched = availableShippingMethods.find((m) => m.id === state.shippingMethod?.id);
    return matched || state.shippingMethod;
  }, [state.shippingMethod, availableShippingMethods]);

  // Compute effective totals for the sticky sidebar even before a shipping method is confirmed
  const effectiveTotals: CheckoutTotals | null = React.useMemo(() => {
    if (items.length === 0) return null;
    return checkoutService.calculateOrderTotals(
      items,
      activeShippingMethod,
      coupon,
      initialLogisticsConfig
    );
  }, [items, activeShippingMethod, coupon, initialLogisticsConfig]);

  // Compute strict totals when user confirms their shipping method
  const totals: CheckoutTotals | null = React.useMemo(() => {
    if (!state.shippingMethod || items.length === 0) return null;
    return checkoutService.calculateOrderTotals(
      items,
      activeShippingMethod,
      coupon,
      initialLogisticsConfig
    );
  }, [items, activeShippingMethod, coupon, initialLogisticsConfig]);

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
        address: state.address,
        shippingMethod: state.shippingMethod,
        coupon,
        orderNotes: state.orderNotes,
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
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Container>
    );
  }

  // Confirmation view
  if (state.step === 'confirmation' && placedOrder) {
    return (
      <Container className="py-12 max-w-3xl mx-auto">
        <OrderConfirmation order={placedOrder} />
      </Container>
    );
  }

  // Empty cart guard
  if (items.length === 0) {
    return (
      <Container className="py-16 max-w-xl mx-auto text-center">
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
    <Container className="py-8 lg:py-12 w-full max-w-6xl mx-auto">
      {/* Mobile-only Collapsible Order Summary Bar */}
      <div className="lg:hidden mb-6 border border-border bg-card shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition cursor-pointer text-left"
          aria-expanded={isMobileSummaryOpen}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
            <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground',
                isMobileSummaryOpen && 'rotate-180'
              )}
            />
          </div>
          <span className="text-sm font-extrabold text-foreground font-mono">
            {effectiveTotals ? effectiveTotals.formattedTotal : ''}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="p-4 border-t border-border bg-background">
            <CheckoutOrderSummary
              items={items}
              totals={effectiveTotals}
              coupon={coupon}
              shippingMethod={state.shippingMethod}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
            />
          </div>
        )}
      </div>

      {/* Main Responsive 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">
        {/* Left Column: Progress & Active Step Content */}
        <div className="lg:col-span-7 w-full space-y-6">
          {/* Header */}
          <div>
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Checkout
            </Heading>
            <Text className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
              Complete your purchase securely.
            </Text>
          </div>

          {/* Progress Tracker */}
          <CheckoutProgress
            currentStep={state.step}
            onStepClick={(step) => {
              dispatch({ type: 'GO_TO_STEP', step });
            }}
          />

          {/* Step 1: Address */}
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

          {/* Step 2: Shipping Method */}
          {state.step === 'shipping' && (
            <ShippingMethodSelector
              defaultValue={state.shippingMethod}
              availableMethods={availableShippingMethods}
              onSubmit={(method) => dispatch({ type: 'SET_SHIPPING_METHOD', method })}
              onBack={() => dispatch({ type: 'GO_TO_STEP', step: 'address' })}
            />
          )}

          {/* Step 3: Review Order */}
          {state.step === 'review' && state.address && state.shippingMethod && totals && (
            <ReviewOrder
              items={items}
              address={state.address}
              shippingMethod={activeShippingMethod}
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

          {/* Step 4: Payment Method */}
          {state.step === 'payment' && (
            <PaymentMethodForm
              defaultValue={state.paymentMethod}
              totals={totals || effectiveTotals}
              coupon={coupon}
              items={items}
              enableCod={initialLogisticsConfig?.enableCod ?? true}
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
        </div>

        {/* Right Column: Sticky Order Summary (Visible on Desktop lg: 1024px+) */}
        <div className="hidden lg:block lg:col-span-5 w-full lg:sticky lg:top-24">
          <CheckoutOrderSummary
            items={items}
            totals={effectiveTotals}
            coupon={coupon}
            shippingMethod={state.shippingMethod}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        </div>
      </div>
    </Container>
  );
}

export default CheckoutPageContent;
