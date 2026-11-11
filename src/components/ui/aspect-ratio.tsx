import * as React from 'react';
import { cn } from '@/core/utils/cn';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number | string; // Supports numeric proportions e.g. 1, 1.25, or string ratios '16/9', '4/5'
}

/**
 * AspectRatio layout container providing proportional child bounding.
 * Cross-browser compatible layout primitive.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, className, children, ...props }, ref) => {
    let parsedRatio = 1;
    if (typeof ratio === 'number') {
      parsedRatio = ratio;
    } else if (typeof ratio === 'string' && ratio.includes('/')) {
      const [width, height] = ratio.split('/').map(Number);
      if (width && height) {
        parsedRatio = width / height;
      }
    }

    return (
      <div
        ref={ref}
        className={cn('relative w-full overflow-hidden', className)}
        style={{
          ...style,
          paddingBottom: `${(1 / parsedRatio) * 100}%`,
        }}
        {...props}
      >
        <div className="absolute inset-0 w-full h-full [&>*]:w-full [&>*]:h-full [&>*]:object-cover">
          {children}
        </div>
      </div>
    );
  }
);
AspectRatio.displayName = 'AspectRatio';

export default AspectRatio;
