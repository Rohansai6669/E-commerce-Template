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
  icon = 'Inbox',
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
      gap="6"
      className={cn(
        'text-center py-12 px-6 border border-dashed border-border rounded-xl bg-card max-w-md mx-auto shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground animate-bounce">
        <Icon name={icon} className="h-6 w-6" />
      </div>

      <Stack gap="2">
        <Heading level={3} className="text-base font-bold tracking-tight">
          {title}
        </Heading>
        <Text className="text-sm text-muted-foreground max-w-xs">
          {description}
        </Text>
      </Stack>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Button variant="outline" className="cursor-pointer" asChild>
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            ) : onSecondaryActionClick ? (
              <Button variant="outline" onClick={onSecondaryActionClick} className="cursor-pointer">
                {secondaryActionLabel}
              </Button>
            ) : null
          )}

          {actionLabel && (
            actionHref ? (
              <Button className="cursor-pointer" asChild>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : onActionClick ? (
              <Button onClick={onActionClick} className="cursor-pointer">
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
