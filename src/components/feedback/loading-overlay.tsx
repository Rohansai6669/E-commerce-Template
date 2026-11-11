import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/core/utils/cn';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  fullscreen?: boolean;
}

/**
 * Screen obscuring loading overlay.
 * Centrally displays the Spinner component inside a backdrop filter.
 */
export function LoadingOverlay({ fullscreen = false, className, ...props }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background/60 backdrop-blur-xs transition-opacity duration-300 z-[1030]',
        fullscreen ? 'fixed inset-0 w-screen h-screen' : 'absolute inset-0 w-full h-full',
        className
      )}
      role="status"
      aria-label="Loading contents"
      aria-live="polite"
      {...props}
    >
      <Spinner size="lg" />
    </div>
  );
}
export default LoadingOverlay;
