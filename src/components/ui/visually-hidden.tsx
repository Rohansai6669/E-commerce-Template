import * as React from 'react';
import { cn } from '@/core/utils/cn';

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Visually hides content while keeping it accessible to screen readers (visually hidden / sr-only).
 */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 border-0 whitespace-nowrap sr-only',
        className
      )}
      {...props}
    />
  );
}
export default VisuallyHidden;
