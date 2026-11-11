import * as React from 'react';
import { Heading } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export interface MiniCartHeaderProps {
  itemCount: number;
  onClose: () => void;
}

/**
 * Slide-over drawer header displaying cart item count.
 */
export function MiniCartHeader({ itemCount, onClose }: MiniCartHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-4 bg-card select-none">
      <Heading level={2} className="text-sm font-bold uppercase tracking-wider font-heading text-foreground">
        Shopping Cart ({itemCount})
      </Heading>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="Close cart"
      >
        <Icon name="X" className="h-4 w-4" />
      </Button>
    </div>
  );
}
export default MiniCartHeader;
