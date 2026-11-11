import * as React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';

export interface QuantitySelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Controlled QuantitySelector stepper.
 * Supports inventory boundary checks and includes proper screen reader labels.
 */
export function QuantitySelector({
  value,
  onValueChange,
  min = 1,
  max,
  className,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onValueChange(value + 1);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center border border-input rounded-md overflow-hidden bg-background h-10 w-fit',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-full w-10 rounded-none border-r border-input hover:bg-muted/50 cursor-pointer"
        aria-label="Decrease item count by 1"
      >
        <Icon name="Minus" className="h-3.5 w-3.5" />
      </Button>

      <span
        className="w-12 text-center text-sm font-semibold select-none text-foreground font-mono"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="h-full w-10 rounded-none border-l border-input hover:bg-muted/50 cursor-pointer"
        aria-label="Increase item count by 1"
      >
        <Icon name="Plus" className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
export default QuantitySelector;
