import * as React from 'react';
import { Grid, type GridProps } from '@/components/layout/grid';

export interface ProductGridProps extends GridProps {
  children?: React.ReactNode;
}

/**
 * Reusable grid layout for rendering catalogs.
 * Inherits all layout properties directly from GridProps.
 */
export function ProductGrid({ className, children, ...props }: ProductGridProps) {
  return (
    <Grid className={className} {...props}>
      {children}
    </Grid>
  );
}
export default ProductGrid;
