import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | 'none';
}

export function Stack({
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = '4',
  className,
  ...props
}: StackProps) {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

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
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        className
      )}
      {...props}
    />
  );
}
export default Stack;
