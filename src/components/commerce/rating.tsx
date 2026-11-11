'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  precision?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onValueChange?: (value: number) => void;
  count?: number; // Optional review count display
}

/**
 * Proportional star rating visualizer.
 * Supports quarter-star linear gradients (precision=0.25), keyboard click inputs, and hovering callbacks.
 */
export function Rating({
  value,
  max = 5,
  precision = 0.5,
  size = 'md',
  interactive = false,
  onValueChange,
  count,
  className,
  ...props
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const activeValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;

    let rounded = index + percent;
    rounded = Math.round(rounded / precision) * precision;
    rounded = Math.max(index, Math.min(index + 1, rounded));
    setHoverValue(rounded);
  };

  const handleClick = () => {
    if (interactive && onValueChange && hoverValue !== null) {
      onValueChange(hoverValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(null);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const fillPercent = Math.max(0, Math.min(1, activeValue - index));
          const gradientId = `star-grad-${index}-${activeValue}`;

          const StarContent = (
            <svg
              viewBox="0 0 24 24"
              className={cn('fill-transparent stroke-muted-foreground/60', sizeClasses[size])}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id={gradientId}>
                  <stop offset={`${fillPercent * 100}%`} stopColor="var(--warning)" />
                  <stop offset={`${fillPercent * 100}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={`url(#${gradientId})`}
                className={fillPercent > 0 ? 'stroke-warning' : ''}
              />
            </svg>
          );

          if (interactive) {
            return (
              <button
                key={index}
                type="button"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5 cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, index)}
                onClick={handleClick}
                aria-label={`Rate ${index + 1} of ${max} stars`}
              >
                {StarContent}
              </button>
            );
          }

          return <div key={index}>{StarContent}</div>;
        })}
      </div>

      {count !== undefined && (
        <span className="text-xs text-muted-foreground font-medium">
          {activeValue.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
export default Rating;
