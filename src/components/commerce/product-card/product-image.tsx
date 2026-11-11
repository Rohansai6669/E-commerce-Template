'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useProductCard } from './product-card';
import { cn } from '@/core/utils/cn';
import { useCart } from '@/components/commerce/cart-context';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { QuickViewModal } from '../quick-view-modal';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';
import { toast } from 'sonner';

export interface ProductCardImageProps {
  aspectRatio?: 'portrait' | 'square' | 'landscape' | string;
  className?: string;
  showWishlist?: boolean;
  showQuickView?: boolean;
  showQuickAdd?: boolean;
}

export function ProductCardImage({
  aspectRatio = 'portrait',
  className,
  showWishlist = true,
  showQuickView = true,
  showQuickAdd = true,
}: ProductCardImageProps) {
  const { product } = useProductCard();
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'landscape'
      ? 'aspect-[4/3]'
      : 'aspect-[3/4]';

  const imageSource = product.images[0] || product.imageUrl || '';
  const hoverImage = product.images[1] || imageSource;

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
      toast.error('Product is out of stock.');
      return;
    }
    setIsAddingToCart(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      imageUrl: imageSource,
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
      <div className={cn(`relative w-full ${aspectClass} overflow-hidden bg-slate-100 dark:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800/60`, className)}>
        <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
          {(!imageSource || imageError) ? (
            <NoImageFallback />
          ) : (
            <Image
              src={imageSource}
              alt={product.name}
              fill
              onError={() => setImageError(true)}
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
        </Link>

        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer shadow-xs"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-slate-200 hover:text-rose-500'}`} />
          </button>
        )}

        {(showQuickView || showQuickAdd) && (
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 z-20">
            {showQuickView && (
              <button
                onClick={handleQuickView}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 shadow-md transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>
            )}
            {showQuickAdd && (
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
        )}
      </div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default ProductCardImage;
