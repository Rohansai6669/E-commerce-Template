'use client';

import * as React from 'react';
import Link from 'next/link';
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
  Heart,
} from 'lucide-react';

import { useCart } from '@/components/commerce/cart-context';
import { toast } from 'sonner';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { formatPrice } from '@/core/pricing/format-price';

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

  const resolvedOptions = React.useMemo(() => {
    if (product.options && product.options.length > 0) {
      return product.options;
    }
    return [
      {
        id: 'opt-size',
        name: 'Size',
        values: [
          { id: 'sz-xs', value: 'XS' },
          { id: 'sz-s', value: 'S' },
          { id: 'sz-m', value: 'M' },
          { id: 'sz-l', value: 'L' },
          { id: 'sz-xl', value: 'XL' },
        ],
      },
    ];
  }, [product.options]);

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const opts = (product.options && product.options.length > 0)
      ? product.options
      : [
          {
            id: 'opt-size',
            name: 'Size',
            values: [
              { id: 'sz-xs', value: 'XS' },
              { id: 'sz-s', value: 'S' },
              { id: 'sz-m', value: 'M' },
              { id: 'sz-l', value: 'L' },
              { id: 'sz-xl', value: 'XL' },
            ],
          },
        ];
    opts.forEach((opt) => {
      if (opt.values.length > 0) {
        const preferred = opt.values.find((v) => v.value.toUpperCase() === 'M') || opt.values[0];
        initial[opt.name] = preferred.value;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(initialIsSaved);
  const [isToggling, setIsToggling] = React.useState(false);

  const activeVariant = findSelectedVariant(product.variants, selectedOptions);

  const currentPrice =
    activeVariant?.price !== null && activeVariant?.price !== undefined
      ? activeVariant.price
      : product.price;

  const stockLimit = activeVariant !== null ? activeVariant.quantity : product.quantity;
  const isOutOfStock = product.status === 'out_of_stock' || stockLimit <= 0;

  // Delivery Estimator State
  const [pincode, setPincode] = React.useState('');
  const [deliveryResult, setDeliveryResult] = React.useState<{
    dateStr: string;
    isCodAvailable: boolean;
    isFreeShipping: boolean;
  } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = React.useState(false);

  // Auto-restore saved customer pincode from local storage
  React.useEffect(() => {
    try {
      const savedPin = typeof window !== 'undefined' ? localStorage.getItem('lexido_user_pincode') : null;
      if (savedPin && /^\d{6}$/.test(savedPin)) {
        setPincode(savedPin);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        setDeliveryResult({
          dateStr: targetDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          isCodAvailable: true,
          isFreeShipping: currentPrice >= 1999,
        });
      }
    } catch {
      // Ignore client storage exceptions
    }
  }, [currentPrice]);

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
    toast.success(`Added ${product.name} to cart!`, {
      id: `cart-${product.id}`,
    });
    setIsAdding(false);
  };

  const handleWishlist = async () => {
    setIsToggling(true);
    try {
      const result = await toggleWishlistAction(product.id);
      if (result.success) {
        setIsFavorited(!!result.isSaved);
        toast.success(result.isSaved ? 'Added to wishlist!' : 'Removed from wishlist.', {
          id: `wishlist-${product.id}`,
        });
      } else {
        toast.error(result.error ?? 'Failed to update wishlist.', {
          id: `wishlist-${product.id}`,
        });
      }
    } catch {
      toast.error('Could not update wishlist.', {
        id: `wishlist-${product.id}`,
      });
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

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lexido_user_pincode', cleanPin);
      }
    } catch {
      // Ignore write errors
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
    <div className="flex flex-col gap-6 w-full select-none">
      {/* 1. Variant selectors (Size / Color) matching reference PDP */}
      {resolvedOptions.map((opt) => (
        <div key={opt.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-950 dark:text-white font-heading">
              {opt.name.toUpperCase()}
            </span>
            {opt.name.toLowerCase().includes('size') && (
              <button
                type="button"
                onClick={() => toast.info('True to size tailored fit. Model is 6\'1" wearing size M.')}
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                SIZE GUIDE
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => {
              const isActive = selectedOptions[opt.name] === val.value;
              const isAvailable = product.variants && product.variants.length > 0
                ? isOptionCombinationAvailable(product.variants, opt.name, val.value, selectedOptions)
                : true;

              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => handleOptionChange(opt.name, val.value)}
                  disabled={!isAvailable && !isActive}
                  className={`h-11 min-w-[52px] px-4 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-black shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {val.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 2. Stock urgency banner (if low stock) */}
      {stockLimit > 0 && stockLimit <= 5 && (
        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 py-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Only {stockLimit} pieces remaining in stock</span>
        </div>
      )}

      {/* 3. Primary CTA Action Row: Full-width ADD TO BAG • ₹... + Square Wishlist */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          disabled={isAdding || isOutOfStock}
          onClick={handleAddToCart}
          className="flex-1 h-13 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-heading font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-none shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? 'ADDING TO BAG...' : isOutOfStock ? 'OUT OF STOCK' : `ADD TO BAG • ${formatPrice(currentPrice)}`}
        </button>

        <button
          type="button"
          disabled={isToggling}
          onClick={handleWishlist}
          className="h-13 w-13 rounded-none border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all cursor-pointer shrink-0 shadow-xs"
          aria-label="Add to Wishlist"
        >
          <Heart className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-black dark:fill-white text-black dark:text-white' : ''}`} />
        </button>
      </div>

      {/* 4. Three-Column Value Perks Bar (Free Ship, Returns, Authentic) */}
      <div className="grid grid-cols-3 border border-neutral-200 dark:border-neutral-800 rounded-none text-center divide-x divide-neutral-200 dark:divide-neutral-800 py-3.5 px-2 bg-neutral-50/50 dark:bg-neutral-900/40 select-none">
        <div className="flex flex-col items-center justify-center gap-1.5 px-1">
          <Truck className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
            FREE SHIP ₹2K+
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 px-1">
          <RotateCcw className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
            15-DAY RETURNS
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 px-1">
          <ShieldCheck className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
            AUTHENTIC
          </span>
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

      {/* 6. Collapsible Information Accordions (Amazon / Flipkart Style) */}
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
            <div className="px-4 pb-3.5 pt-2 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border/40 bg-muted/5 space-y-3">
              <p className="whitespace-pre-line text-foreground/90">
                {product.description ||
                  `Signature ${product.name} crafted by ${product.brandName || 'Lexido'}. Designed with precision tailoring, breathable comfort, and durable finish.`}
              </p>

              {/* Key Bullet Highlights */}
              <div className="pt-2 border-t border-border/50 space-y-1.5 text-[11px]">
                {product.fit && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Fit:</span>
                    <span>{product.fit}</span>
                  </div>
                )}
                {product.pattern && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Pattern:</span>
                    <span>{product.pattern}</span>
                  </div>
                )}
                {product.occasion && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Occasion:</span>
                    <span>{product.occasion}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Style Code:</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>
                )}
              </div>
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
            <div className="px-4 pb-3.5 pt-2 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border/40 bg-muted/5 space-y-2">
              <p>
                <strong className="text-foreground">Fabric Composition:</strong>{' '}
                {product.material || '100% Premium Heavyweight Cotton / Rich Textile Blend'}
              </p>
              <p>
                <strong className="text-foreground">Care Instructions:</strong>{' '}
                {product.careInstructions ||
                  'Machine wash cold (30°C) with like colors. Turn inside out before laundering. Do not bleach or tumble dry high. Cool iron on reverse.'}
              </p>
              <p>
                <strong className="text-foreground">Country of Origin:</strong>{' '}
                {product.countryOfOrigin || 'India'}
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
            <div className="px-4 pb-3.5 pt-2 text-xs text-muted-foreground leading-relaxed font-sans border-t border-border/40 bg-muted/5 space-y-2">
              <p>
                <strong className="text-foreground">Dispatch & Handling:</strong> Orders are verified and dispatched within 24–48 hours from our fulfillment hub.
              </p>
              <p>
                <strong className="text-foreground">Delivery Window:</strong> 3–5 business days to all serviceable pin codes across India.
              </p>
              <p>
                <strong className="text-foreground">Returns & Exchanges:</strong> Eligible for free doorstep return or size exchange within 7 days of delivery in original condition with tags intact.
              </p>
              <div className="flex items-center gap-4 pt-1.5">
                <Link
                  href="/shipping-policy"
                  className="text-primary hover:underline font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  Shipping Policy &rarr;
                </Link>
                <Link
                  href="/refund-policy"
                  className="text-primary hover:underline font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  Return Policy &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
