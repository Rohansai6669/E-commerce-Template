'use client';

import * as React from 'react';
import Link from 'next/link';
import { navigationConfig } from '@/core/storefront/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/typography';
import { cn } from '@/core/utils/cn';

/**
 * Mobile navigation sidebar drawer.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="lg:hidden flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
        className="cursor-pointer"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} className="h-6 w-6" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[var(--header-height)] z-[1020] bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-[var(--header-height)] right-0 z-[1020] h-[calc(100vh-var(--header-height))] w-72 bg-card border-l border-border p-6 shadow-xl transition-transform duration-300 ease-emphasized flex flex-col gap-6',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col gap-5 overflow-y-auto">
          {navigationConfig.map((section, idx) => {
            const hasDropdown = !!(section.groups && section.groups.length > 0);

            if (!hasDropdown) {
              return (
                <Link
                  key={idx}
                  href={section.href || '/'}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-primary transition-colors py-1.5 cursor-pointer"
                >
                  {section.label}
                </Link>
              );
            }

            return (
              <div key={idx} className="flex flex-col gap-3">
                <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 font-heading">
                  {section.label}
                </Text>
                <div className="flex flex-col gap-3.5 pl-2">
                  {section.groups?.map((group, groupIdx) => (
                    <div key={groupIdx} className="flex flex-col gap-2">
                      <Text className="text-xs font-bold text-muted-foreground/80 uppercase">
                        {group.title}
                      </Text>
                      <div className="flex flex-col gap-2 pl-1.5">
                        {group.items.map((item, itemIdx) => (
                          <Link
                            key={itemIdx}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default MobileNav;
