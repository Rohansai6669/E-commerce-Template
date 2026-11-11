'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';
import { cn } from '@/core/utils/cn';

export interface ProductImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  ratio?: number | string;
  zoomOnHover?: boolean;
}

/**
 * Aspect-bounded Product Image.
 * Integrates skeleton states, hover zoom transformations, and fallback placeholders.
 */
export function ProductImage({
  src,
  alt,
  ratio = '4/5',
  zoomOnHover = true,
  className,
  ...props
}: ProductImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const hasValidSrc = Boolean(src && src.trim() !== '');

  if (!hasValidSrc || error) {
    return (
      <AspectRatio ratio={ratio} className="bg-muted overflow-hidden rounded-md relative">
        <NoImageFallback />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={ratio} className="bg-muted overflow-hidden rounded-md relative">
      {!isLoaded && <Skeleton className="absolute inset-0 w-full h-full z-[1]" />}
      <Image
        src={src!}
        alt={alt}
        fill
        className={cn(
          'w-full h-full object-cover transition-all duration-300 ease-standard',
          zoomOnHover && 'hover:scale-105',
          !isLoaded ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          setIsLoaded(true);
        }}
        {...props}
      />
    </AspectRatio>
  );
}
export default ProductImage;
