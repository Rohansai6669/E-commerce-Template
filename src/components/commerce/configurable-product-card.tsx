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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTogglingWishlist(true);
    try {
      const res = await toggleWishlistAction(product.id);
      if (res.success) {
        setIsWishlisted(!!res.isSaved);
        toast.success(res.isSaved ? 'Added to wishlist!' : 'Removed from wishlist.');
      } else {
        toast.error(res.error || 'Failed to update wishlist.');
      }
    } catch {
      toast.error('Could not update wishlist.');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error('This product is currently out of stock.');
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
    toast.success(`Added ${product.name} to cart!`);
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
        className={`group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card text-card-foreground overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media Container */}
        <div className={`relative w-full ${aspectClasses} bg-slate-100 dark:bg-slate-800/50 overflow-hidden cursor-pointer border-b border-slate-100 dark:border-slate-800/60`}>
          <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
            {(!primaryImage || imageError) ? (
              <NoImageFallback />
            ) : (
              <Image
                src={config.hoverImageEnabled && isHovered && hoverImage ? hoverImage : primaryImage}
                alt={product.name}
                fill
                onError={() => setImageError(true)}
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}
          </Link>

          {/* Badges */}
          {config.showBadges && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
              {!product.inStock && (
                <span className="rounded-full bg-slate-900/90 text-white dark:bg-slate-100/90 dark:text-slate-900 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/10">
                  Sold Out
                </span>
              )}
              {product.inStock && discountPercent && config.showDiscount && (
                <span className="rounded-full bg-rose-600 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {product.inStock &&
                product.badges?.map((badge, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-slate-900/90 text-white dark:bg-slate-100/90 dark:text-slate-900 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/10"
                  >
                    {badge}
                  </span>
                ))}
            </div>
          )}

          {/* Wishlist Button */}
          {config.showWishlist && (
            <button
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer shadow-xs"
              aria-label="Add to wishlist"
            >
              <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-slate-200 hover:text-rose-500'}`} />
            </button>
          )}

          {/* Quick View / Quick Add Overlay */}
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 z-20">
            {config.quickViewEnabled && (
              <button
                onClick={handleQuickView}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 shadow-md transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>
            )}
            {config.showQuickAdd && (
              <button
                onClick={handleQuickAdd}
                disabled={isAddingToCart || !product.inStock}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {isAddingToCart ? 'Adding...' : product.inStock ? 'Quick Add' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>

        {/* Content Metadata */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-card">
          <div className="space-y-1.5">
            {config.showCategory && product.category && (
              <p className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                {product.category}
              </p>
            )}

            {config.showName && (
              <Link
                href={`/products/${product.slug}`}
                className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug block font-sans"
              >
                {product.name}
              </Link>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {/* Rating */}
            {config.showRating && product.rating !== undefined && product.rating !== null && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-xs text-foreground">{product.rating}</span>
                {config.showReviewCount && product.reviewCount !== undefined && (
                  <span className="text-muted-foreground font-normal text-[11px]">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Pricing */}
            {config.showPrice && (
              <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {config.showCompareAtPrice && product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xs text-slate-400 line-through font-normal">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    {discountPercent && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-md">
                        -{discountPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
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
