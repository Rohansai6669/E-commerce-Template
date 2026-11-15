import * as React from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { cn } from '@/core/utils/cn';

import Link from 'next/link';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
  secondaryActionHref?: string;
}

/**
 * Reusable fallback view for empty carts, wishlist misses, and empty search lists.
 */
export function EmptyState({
  icon = 'Package',
  title,
  description,
  actionLabel,
  onActionClick,
  actionHref,
  secondaryActionLabel,
  onSecondaryActionClick,
  secondaryActionHref,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="5"
      className={cn(
        'text-center py-12 sm:py-16 px-6 sm:px-12 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-none bg-white dark:bg-neutral-950/40 max-w-lg mx-auto shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300">
        <Icon name={icon} className="h-6 w-6 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-heading text-neutral-950 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Button variant="outline" className="cursor-pointer h-11 px-7 rounded-none text-xs font-bold uppercase tracking-widest border-neutral-300 hover:bg-neutral-100" asChild>
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            ) : onSecondaryActionClick ? (
              <Button variant="outline" onClick={onSecondaryActionClick} className="cursor-pointer h-11 px-7 rounded-none text-xs font-bold uppercase tracking-widest border-neutral-300 hover:bg-neutral-100">
                {secondaryActionLabel}
              </Button>
            ) : null
          )}

          {actionLabel && (
            actionHref ? (
              <Button className="cursor-pointer h-11 px-8 rounded-none bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm" asChild>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : onActionClick ? (
              <Button onClick={onActionClick} className="cursor-pointer h-11 px-8 rounded-none bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                {actionLabel}
              </Button>
            ) : null
          )}
        </div>
      )}
    </Stack>
  );
}
export default EmptyState;
