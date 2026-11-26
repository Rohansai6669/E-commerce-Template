'use client';

import React, { useState } from 'react';
import { ProductCardConfig } from '@/types/cms';
import { defaultProductCardConfig } from '@/lib/cms/defaults';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { normalizeProduct, UnifiedProduct } from './product-adapter';
import { formatPrice } from '@/core/pricing/format-price';
import { useCart } from '@/components/commerce/cart-context';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { QuickViewModal } from './quick-view-modal';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';
import { toast } from 'sonner';

export type ProductData = any;

export interface ConfigurableProductCardProps {
  product: ProductData;
  config?: ProductCardConfig;
  className?: string;
  isWishlistedInitial?: boolean;
}

const COLOR_SWATCH_MAP: Record<string, string> = {
  black: '#171717',
  noir: '#111111',
  white: '#ffffff',
  red: '#dc2626',
  crimson: '#991b1b',
  ruby: '#9b111e',
  maroon: '#800000',
  burgundy: '#800020',
  gold: '#d4af37',
  yellow: '#eab308',
  amber: '#f59e0b',
  orange: '#f97316',
  rust: '#b45309',
  coral: '#fb7185',
  pink: '#ec4899',
  rose: '#f43f5e',
  blue: '#2563eb',
  navy: '#1e293b',
  denim: '#3b82f6',
  sky: '#0ea5e9',
  cyan: '#06b6d4',
  teal: '#0d9488',
  green: '#16a34a',
  emerald: '#059669',
  forest: '#14532d',
  olive: '#556b2f',
  sage: '#84a98c',
  purple: '#9333ea',
  violet: '#7c3aed',
  indigo: '#4f46e5',
  lavender: '#c084fc',
  beige: '#ece6db',
  cream: '#f5f0e6',
  sand: '#e8dcce',
  ecru: '#f2eee9',
  khaki: '#c3b091',
  tan: '#d2b48c',
  camel: '#c19a6b',
  brown: '#6e473b',
  chocolate: '#3e2723',
  mocha: '#5d4037',
  grey: '#71717a',
  gray: '#71717a',
  charcoal: '#374151',
  silver: '#cbd5e1',
  oatmeal: '#ede6d6',
};

function resolveColorSwatch(colorVal?: string): string {
  if (!colorVal) return '#171717';
  const clean = colorVal.toLowerCase().trim();
  if (COLOR_SWATCH_MAP[clean]) return COLOR_SWATCH_MAP[clean];
  if (clean.startsWith('#') || clean.startsWith('rgb') || clean.startsWith('hsl')) return clean;
  return clean;
}

export function ConfigurableProductCard({
  product: rawProduct,
  config = defaultProductCardConfig,
  className = '',
  isWishlistedInitial = false,
}: ConfigurableProductCardProps) {
  const product: UnifiedProduct = normalizeProduct(rawProduct);
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitial);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  }[config.aspectRatio || 'portrait'] || 'aspect-[3/4]';

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const primaryImage = product.images[0] || product.imageUrl || '';
  const hoverImage = product.images[1] || primaryImage;

  const displayColors = product.colors && product.colors.length > 0
    ? Array.from(new Set(product.colors)).slice(0, 5)
    : [];

  const brandName = product.brand || 'ATELIER BOMBAY';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTogglingWishlist(true);
    try {
      const res = await toggleWishlistAction(product.id);
      if (res.success) {
        setIsWishlisted(!!res.isSaved);
        toast.success(res.isSaved ? 'Added to wishlist!' : 'Removed from wishlist.', {
          id: `wishlist-${product.id}`,
        });
      } else {
        toast.error(res.error || 'Failed to update wishlist.', {
          id: `wishlist-${product.id}`,
        });
      }
    } catch {
      toast.error('Could not update wishlist.', {
        id: `wishlist-${product.id}`,
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error('This product is currently out of stock.', {
        id: `cart-${product.id}`,
      });
      return;
    }
    setIsAddingToCart(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      imageUrl: primaryImage,
      price: product.price,
      options: {},
      quantity: 1,
      stockLimit: product.quantity ?? 10,
    });
    toast.success(`Added ${product.name} to cart!`, {
      id: `cart-${product.id}`,
    });
    setIsAddingToCart(false);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        suppressHydrationWarning
        className={`group relative bg-transparent text-foreground overflow-hidden flex flex-col h-full rounded-none transition-all duration-300 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media Container */}
        <div className={`relative w-full ${aspectClasses} bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-pointer`}>
          <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
            {(!primaryImage || imageError) ? (
              <NoImageFallback />
            ) : (
              <Image
                src={config.hoverImageEnabled && isHovered && hoverImage ? hoverImage : primaryImage}
                alt={product.name}
                fill
                onError={() => setImageError(true)}
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}
          </Link>

          {/* Badges: Top-Left NEW (Black), Top-Right SALE (White Box) */}
          {config.showBadges && (
            <>
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                {!product.inStock ? (
                  <span className="bg-black text-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-none shadow-xs">
                    Sold Out
                  </span>
                ) : (
                  <span className="bg-black text-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-none shadow-xs">
                    {product.badges?.[0] || 'NEW'}
                  </span>
                )}
              </div>

              {product.inStock && discountPercent && config.showDiscount && (
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                  <span className="bg-white text-black border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-none shadow-xs">
                    SALE
                  </span>
                </div>
              )}
            </>
          )}

          {/* Wishlist Button */}
          {config.showWishlist && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className={`absolute ${discountPercent ? 'top-10' : 'top-2.5'} right-2.5 h-8 w-8 rounded-none bg-background/90 backdrop-blur-xs border border-border flex items-center justify-center text-foreground transition-all duration-200 z-20 cursor-pointer shadow-xs ${
                isHovered || isWishlisted ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`} />
            </button>
          )}

          {/* Quick View / Quick Add Overlay */}
          <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-20">
            {config.quickViewEnabled && (
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleQuickView}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-none bg-background/95 text-foreground border border-border py-2 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-muted shadow-xs transition-all cursor-pointer"
              >
                <Eye className="h-3 w-3" />
                Quick View
              </button>
            )}
            {config.showQuickAdd && (
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleQuickAdd}
                disabled={isAddingToCart || !product.inStock}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-none bg-foreground text-background hover:opacity-90 py-2 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-3 w-3" />
                {isAddingToCart ? '...' : product.inStock ? 'Quick Add' : 'Out'}
              </button>
            )}
          </div>
        </div>

        {/* Content Metadata: Pixel-Perfect Reference 4-Row Simple & Smooth Luxury Editorial Layout */}
        <div className="pt-2.5 pb-1 flex flex-col gap-0.5 bg-transparent select-none">
          {/* Row 1: Product Name (Left) + Price (Right) */}
          <div className="flex items-baseline justify-between gap-2">
            {config.showName && (
              <Link
                href={`/products/${product.slug}`}
                className="text-neutral-950 dark:text-white hover:opacity-75 font-sans font-medium text-[13px] sm:text-[14px] tracking-[0.02em] uppercase leading-snug transition-opacity line-clamp-1 flex-1 pr-2"
                title={product.name}
              >
                {product.name}
              </Link>
            )}
            {config.showPrice && (
              <span className="font-sans font-medium text-[13px] sm:text-[14px] tracking-tight text-neutral-950 dark:text-white shrink-0 text-right">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Row 2: Fit / Subcategory (Left) + Compare-at Price (Right) */}
          <div className="flex items-baseline justify-between gap-2">
            {config.showCategory && (
              <span className="text-[11px] sm:text-[11.5px] font-normal tracking-[0.16em] sm:tracking-[0.18em] text-neutral-600 dark:text-neutral-400 uppercase line-clamp-1">
                {product.fit || product.category || 'OVERSIZED'}
              </span>
            )}
            {config.showCompareAtPrice && product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="text-[11px] sm:text-[11.5px] text-neutral-500 dark:text-neutral-400 line-through font-normal shrink-0 text-right">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          {/* Row 3: Color Swatch Dot */}
          {displayColors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1 pb-0.5">
              {displayColors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300/80 dark:border-neutral-600 shrink-0 transition-transform hover:scale-125"
                  style={{ backgroundColor: resolveColorSwatch(color) }}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Row 4: Brand / Studio Attribution */}
          <div className="flex items-center">
            <span className="text-[10px] sm:text-[10.5px] font-normal tracking-[0.16em] sm:tracking-[0.18em] text-neutral-600 dark:text-neutral-400 uppercase">
              BY {brandName}
            </span>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default ConfigurableProductCard;
