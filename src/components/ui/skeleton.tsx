import * as React from 'react';
import { cn } from '@/core/utils/cn';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-muted/60', className)}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
