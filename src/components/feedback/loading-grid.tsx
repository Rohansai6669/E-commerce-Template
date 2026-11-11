import * as React from 'react';
import { Grid } from '@/components/layout/grid';
import LoadingProductCard from './loading-product-card';

export interface LoadingGridProps {
  count?: number;
  cols?: '1' | '2' | '3' | '4' | '6' | '12' | 'none';
  colsSm?: '1' | '2' | '3' | '4' | '6';
  colsMd?: '1' | '2' | '3' | '4' | '6' | '8';
  colsLg?: '1' | '2' | '3' | '4' | '6' | '12';
}

/**
 * Grid layout rendering dynamic skeletal loading product cards.
 */
export function LoadingGrid({
  count = 4,
  cols = '1',
  colsSm = '2',
  colsMd = '3',
  colsLg = '4',
}: LoadingGridProps) {
  return (
    <Grid cols={cols} colsSm={colsSm} colsMd={colsMd} colsLg={colsLg}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingProductCard key={index} />
      ))}
    </Grid>
  );
}
export default LoadingGrid;
