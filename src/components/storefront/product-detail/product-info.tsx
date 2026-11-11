'use client';

import * as React from 'react';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { StockBadge } from '@/components/commerce/stock-badge';
import { AddToCartButton } from '@/components/commerce/add-to-cart-button';
import { WishlistButton } from '@/components/commerce/wishlist-button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Button } from '@/components/ui/button';
import { type ProductDetailModel } from '@/core/product/product.types';
import { findSelectedVariant, isOptionCombinationAvailable } from '@/core/product/variant';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Banknote,
  ChevronDown,
  MapPin,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';

import { useCart } from '@/components/commerce/cart-context';
import { toast } from 'sonner';
import { toggleWishlistAction } from '@/app/actions/wishlist';

export interface ProductInfoProps {
  product: ProductDetailModel;
  initialIsSaved?: boolean;
}

/**
 * Interactive Client Component resolving variant choices, stock availability checks,
 * cart mutations, pincode delivery estimates, trust perks, and product details accordions.
 */
export function ProductInfo({ product, initialIsSaved = false }: ProductInfoProps) {
  const { addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.values.length > 0) {
        initial[opt.name] = opt.values[0].value;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(initialIsSaved);
  const [isToggling, setIsToggling] = React.useState(false);

  // Delivery Estimator State
  const [pincode, setPincode] = React.useState('');
  const [deliveryResult, setDeliveryResult] = React.useState<{
    dateStr: string;
    isCodAvailable: boolean;
    isFreeShipping: boolean;
  } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = React.useState(false);

  // Accordion open states (multiple or single)
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({
    overview: true,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeVariant = findSelectedVariant(product.variants, selectedOptions);

  const currentPrice =
    activeVariant?.price !== null && activeVariant?.price !== undefined
      ? activeVariant.price
      : product.price;

  const stockLimit = activeVariant !== null ? activeVariant.quantity : product.quantity;
  const isOutOfStock = product.status === 'out_of_stock' || stockLimit <= 0;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    setQuantity(1); // Reset quantity stepper to 1
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: activeVariant?.id || null,
      name: product.name,
      slug: product.slug,
      imageUrl:
        product.images.length > 0
          ? typeof product.images[0] === 'string'
            ? product.images[0]
            : product.images[0].url
          : null,
      price: currentPrice,
      options: selectedOptions,
      quantity,
      stockLimit,
    });
    toast.success(`Added ${product.name} to cart!`);
    setIsAdding(false);
  };

  const handleWishlist = async () => {
    setIsToggling(true);
    try {
      const result = await toggleWishlistAction(product.id);
      if (result.success) {
        setIsFavorited(!!result.isSaved);
        toast.success(result.isSaved ? 'Added to wishlist!' : 'Removed from wishlist.');
      } else {
        toast.error(result.error ?? 'Failed to update wishlist.');
      }
    } catch {
      toast.error('Could not update wishlist.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      toast.error('Please enter a valid 6-digit postal pincode.');
      return;
    }

    setIsCheckingPincode(true);
    // Simulate smart dynamic courier SLA calculation
    setTimeout(() => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      const formatted = targetDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      setDeliveryResult({
        dateStr: formatted,
        isCodAvailable: true,
        isFreeShipping: currentPrice >= 1999,
      });
      setIsCheckingPincode(false);
      toast.success(`Delivery available to pincode ${cleanPin}!`);
    }, 400);
  };

  return (
    <Stack gap="6" className="w-full">
      {/* 1. Variant selectors */}
      {product.options.map((opt) => (
        <Stack key={opt.id} gap="2">
          <div className="flex items-center justify-between">
            <Heading
              level={4}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading"
            >
              {opt.name}:{' '}
              <span className="text-foreground font-semibold lowercase first-letter:uppercase">
                {selectedOptions[opt.name] || 'Select'}
              </span>
            </Heading>
          </div>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => {
              const isActive = selectedOptions[opt.name] === val.value;
              const isAvailable = isOptionCombinationAvailable(
                product.variants,
                opt.name,
                val.value,
                selectedOptions
              );

              return (
                <Button
                  key={val.id}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleOptionChange(opt.name, val.value)}
                  disabled={!isAvailable && !isActive}
                  className={`h-9 px-4 font-semibold text-xs cursor-pointer border-border transition-all ${
                    isActive
                      ? 'shadow-sm ring-1 ring-primary'
                      : 'hover:border-foreground/50'
                  }`}
                >
                  {val.value}
                </Button>
              );
            })}
          </div>
        </Stack>
      ))}

      {/* 2. Stock badges & warnings */}
      <Stack gap="2">
        <Heading
          level={4}
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading"
        >
          Availability Status
        </Heading>
        <div className="flex items-center gap-3">
          <StockBadge quantity={stockLimit} />
          {stockLimit > 0 && stockLimit <= 5 && (
            <Text className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Only {stockLimit} units left in stock!
            </Text>
          )}
        </div>
      </Stack>

      {/* 3. QuantityStepper & Add to Cart button */}
      <Stack gap="4">
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={quantity}
            onValueChange={setQuantity}
            min={1}
            max={stockLimit}
            disabled={isOutOfStock}
          />
          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <AddToCartButton
              isLoading={isAdding}
              isOutOfStock={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 cursor-pointer h-11 text-xs uppercase tracking-wider font-bold shadow-sm"
            >
              Add to Cart
            </AddToCartButton>
            <WishlistButton
              isFavorited={isFavorited}
              isLoading={isToggling}
              onClick={handleWishlist}
            />
          </div>
        </div>
      </Stack>

      {/* 4. Luxury Value Perks Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
          <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">Free Shipping</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Complimentary on orders over ₹1,999
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
          <RotateCcw className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">7-Day Returns</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Hassle-free doorstep exchanges & refund
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">100% Authentic</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Verified original Lexido atelier craft
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
          <Banknote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">Cash on Delivery</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Available across all major PIN codes
            </p>
          </div>
        </div>
      </div>

      {/* 5. Delivery Pincode Checker */}
      <div className="p-3.5 rounded-lg border border-border bg-card shadow-xs">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Estimated Delivery & Services
          </span>
        </div>

        <form onSubmit={handleCheckPincode} className="flex items-center gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            className="flex-1 h-9 px-3 text-xs bg-muted/30 border border-border rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={isCheckingPincode || pincode.length !== 6}
            className="h-9 px-4 text-xs font-bold uppercase cursor-pointer"
          >
            {isCheckingPincode ? 'Checking...' : 'Check'}
          </Button>
        </form>

        {deliveryResult && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>
                Expected delivery by <strong>{deliveryResult.dateStr}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span>✓ Cash on Delivery Available</span>
              <span>•</span>
              <span>
                {deliveryResult.isFreeShipping
                  ? '✓ Free Shipping Included'
                  : 'Standard Shipping: ₹99'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Collapsible Information Accordions */}
      <div className="border border-border rounded-lg divide-y divide-border bg-card overflow-hidden">
        {/* Accordion 1: Description & Silhouette */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('overview')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <span>Product Story & Overview</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordions.overview ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.overview && (
            <div className="px-4 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-sans border-t border-border/40 bg-muted/5">
              {product.description ||
                'Engineered with premium craftsmanship and attention to silhouette detail. Designed for comfort, durability, and contemporary streetwear expression.'}
            </div>
          )}
        </div>

        {/* Accordion 2: Materials & Care */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('care')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <span>Fabric & Garment Care</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordions.care ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.care && (
            <div className="px-4 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border/40 bg-muted/5 space-y-1.5">
              <p>
                <strong>Composition:</strong>{' '}
                {product.material || '100% Premium Heavyweight Cotton / Rich Blend'}
              </p>
              <p>
                <strong>Care Instructions:</strong> Machine wash cold (30°C) with like colors.
                Turn inside out before washing. Do not bleach or tumble dry high. Cool iron on
                reverse if necessary.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 3: Shipping & Returns */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('shipping')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <span>Shipping & Return Policy</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordions.shipping ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.shipping && (
            <div className="px-4 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border/40 bg-muted/5 space-y-1.5">
              <p>
                <strong>Dispatch:</strong> Orders are verified and dispatched within 24–48
                hours from our fulfillment center.
              </p>
              <p>
                <strong>Returns & Exchanges:</strong> Eligible for free doorstep return or size
                exchange within 7 days of delivery in original unworn condition with tags.
              </p>
            </div>
          )}
        </div>
      </div>
    </Stack>
  );
}

export default ProductInfo;
