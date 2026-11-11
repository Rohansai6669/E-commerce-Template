import * as React from 'react';
import { cn } from '@/core/utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: '1' | '2' | '3' | '4' | '6' | '12' | 'none';
  colsSm?: '1' | '2' | '3' | '4' | '6';
  colsMd?: '1' | '2' | '3' | '4' | '6' | '8';
  colsLg?: '1' | '2' | '3' | '4' | '6' | '12';
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | 'none';
}

export function Grid({
  cols = '1',
  colsSm,
  colsMd,
  colsLg,
  gap = '4',
  className,
  ...props
}: GridProps) {
  const colClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
    '6': 'grid-cols-6',
    '12': 'grid-cols-12',
    none: 'grid-cols-none',
  };

  const smClasses = colsSm ? {
    '1': 'sm:grid-cols-1',
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-3',
    '4': 'sm:grid-cols-4',
    '6': 'sm:grid-cols-6',
  }[colsSm] : '';

  const mdClasses = colsMd ? {
    '1': 'md:grid-cols-1',
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
    '6': 'md:grid-cols-6',
    '8': 'md:grid-cols-8',
  }[colsMd] : '';

  const lgClasses = colsLg ? {
    '1': 'lg:grid-cols-1',
    '2': 'lg:grid-cols-2',
    '3': 'lg:grid-cols-3',
    '4': 'lg:grid-cols-4',
    '6': 'lg:grid-cols-6',
    '12': 'lg:grid-cols-12',
  }[colsLg] : '';

  const gapClasses = {
    '1': 'gap-space-1',
    '2': 'gap-space-2',
    '3': 'gap-space-3',
    '4': 'gap-space-4',
    '5': 'gap-space-5',
    '6': 'gap-space-6',
    '8': 'gap-space-8',
    '10': 'gap-space-10',
    '12': 'gap-space-12',
    '16': 'gap-space-16',
    none: 'gap-0',
  };

  return (
    <div
      className={cn(
        'grid',
        colClasses[cols],
        smClasses,
        mdClasses,
        lgClasses,
        gapClasses[gap],
        className
      )}
      {...props}
    />
  );
}
export default Grid;
