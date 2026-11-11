'use client';

import * as React from 'react';
import { useProductCard } from './product-card';
import AddToCartButton from '../add-to-cart-button';
import WishlistButton from '../wishlist-button';
import { cn } from '@/core/utils/cn';
import { useCart } from '@/components/commerce/cart-context';
import { toast } from 'sonner';
import { toggleWishlistAction } from '@/app/actions/wishlist';

export interface ProductCardActionsProps {
  onAddToCart?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onWishlistToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isFavorited?: boolean;
  isAddingToCart?: boolean;
  isTogglingWishlist?: boolean;
  className?: string;
}

export function ProductCardActions({
  onAddToCart,
  onWishlistToggle,
  isFavorited = false,
  isAddingToCart = false,
  isTogglingWishlist = false,
  className,
}: ProductCardActionsProps) {
  const { product } = useProductCard();
  const { addItem } = useCart();
  const isOutOfStock = !product.inStock || product.status === 'out_of_stock' || (product.quantity !== undefined && product.quantity <= 0);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onAddToCart) {
      onAddToCart(e);
      return;
    }
    e.preventDefault();
    if (isOutOfStock) {
      toast.error('Product is out of stock.');
      return;
    }
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl || product.images[0] || null,
      price: product.price,
      options: {},
      quantity: 1,
      stockLimit: product.quantity ?? 10,
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  const [toggled, setToggled] = React.useState(isFavorited);
  const [isToggling, setIsToggling] = React.useState(false);

  const handleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onWishlistToggle) {
      onWishlistToggle(e);
      return;
    }
    e.preventDefault();
    setIsToggling(true);
    try {
      const result = await toggleWishlistAction(product.id);
      if (result.success) {
        setToggled(!!result.isSaved);
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

  return (
    <div className={cn('flex items-center gap-2 w-full mt-auto pt-2', className)}>
      <AddToCartButton
        isLoading={isAddingToCart}
        isOutOfStock={isOutOfStock}
        onClick={handleAdd}
        className="flex-1 cursor-pointer rounded-xl font-semibold"
      />
      <WishlistButton
        isFavorited={toggled}
        isLoading={isToggling || isTogglingWishlist}
        onClick={handleWishlist}
        className="rounded-xl"
      />
    </div>
  );
}

export default ProductCardActions;
