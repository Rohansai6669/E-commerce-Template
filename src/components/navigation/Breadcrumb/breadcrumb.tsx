import * as React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/core/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

/**
 * Accessible Breadcrumb navigation trace.
 */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground', className)}
      {...props}
    >
      <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer">
        <Icon name="Home" className="h-3.5 w-3.5" />
        <span className="sr-only">Go to Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <Icon name="ChevronRight" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/45" />
            {isLast || !item.href ? (
              <span className="font-semibold text-foreground truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors truncate cursor-pointer">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
export default Breadcrumb;
