'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye, Check, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/core/pricing/format-price';
import { useCart } from '@/components/commerce/cart-context';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { toast } from 'sonner';

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  images: string[];
  badges?: string[];
  inStock?: boolean;
  description?: string;
  quantity?: number;
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL'];

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState('M');
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop'];

  const currentImage = images[selectedImageIndex] || images[0];

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      imageUrl: currentImage,
      price: product.price,
      options: { Size: selectedSize },
      quantity,
      stockLimit: product.quantity ?? 10,
    });
    toast.success(`Added ${quantity} x ${product.name} (${selectedSize}) to cart!`);
    setIsAdding(false);
    onClose();
  };

  const handleWishlistToggle = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-4xl p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name} - Quick View</DialogTitle>
          <DialogDescription>Preview product details, pricing, and add to cart</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="bg-muted/40 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-border">
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-background shadow-xs">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {discountPercent && (
                <span className="absolute top-3 left-3 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground uppercase tracking-wider shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto w-full pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                      selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Badges */}
              <div className="flex items-center justify-between gap-2">
                {product.category && (
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {product.category}
                  </span>
                )}
                {product.inStock !== false ? (
                  <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              {product.rating !== undefined && product.rating !== null && (
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm text-foreground">{product.rating}</span>
                  </div>
                  {product.reviewCount !== undefined && (
                    <span className="text-muted-foreground font-normal">
                      ({product.reviewCount} customer reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Description preview */}
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.description || 'Crafted with premium materials for maximum comfort and stylish everyday versatility.'}
              </p>

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                  <span>Select Size</span>
                  <span className="text-muted-foreground text-[11px]">Standard Fit</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-card hover:bg-muted text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-border bg-muted/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-muted transition-colors cursor-pointer rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-muted transition-colors cursor-pointer rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.inStock === false}
                  className="flex-1 py-6 rounded-xl font-semibold text-sm cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  disabled={isTogglingWishlist}
                  className="p-3 py-6 rounded-xl border-border cursor-pointer hover:bg-muted"
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </Button>
              </div>

              <Button
                variant="ghost"
                asChild
                className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Link href={`/products/${product.slug}`} onClick={onClose}>
                  View Full Product Details <ExternalLink className="h-3.5 w-3.5 ml-1.5 inline" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
