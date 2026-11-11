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

import { useCart } from '@/components/commerce/cart-context';
import { toast } from 'sonner';
import { toggleWishlistAction } from '@/app/actions/wishlist';

export interface ProductInfoProps {
  product: ProductDetailModel;
  initialIsSaved?: boolean;
}

/**
 * Interactive Client Component resolving variant choices, stock availability checks, and cart mutations.
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
      imageUrl: product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : null,
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

  return (
    <Stack gap="6" className="w-full">
      {/* 1. Variant selectors */}
      {product.options.map((opt) => (
        <Stack key={opt.id} gap="2">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            {opt.name}
          </Heading>
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
                  className="h-9 px-4 font-semibold text-xs cursor-pointer border-border"
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
        <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
          Availability Status
        </Heading>
        <div className="flex items-center gap-3">
          <StockBadge quantity={stockLimit} />
          {stockLimit > 0 && stockLimit <= 5 && (
            <Text className="text-xs font-bold text-stock-low animate-pulse">
              Only a few units remaining!
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
              className="flex-1 cursor-pointer"
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
    </Stack>
  );
}
export default ProductInfo;
