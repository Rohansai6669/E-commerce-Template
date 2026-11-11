/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Link from 'next/link';
import { navigationConfig } from '@/core/storefront/navigation';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/typography';

/**
 * Desktop Navigation Megamenu renderer styled for LEXIDO's data-driven taxonomy.
 */
export function DesktopNav() {
  return (
    <nav className="hidden lg:flex items-center gap-7 h-full">
      {navigationConfig.map((section, idx) => {
        const hasDropdown = !!(section.groups && section.groups.length > 0);

        if (!hasDropdown) {
          return (
            <Link
              key={idx}
              href={section.href || '/'}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
            >
              {section.label}
            </Link>
          );
        }

        const isWide = (section.groups?.length || 0) > 1;

        return (
          <div key={idx} className="relative group h-full flex items-center">
            <Link
              href={section.href || '#'}
              className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors py-2 cursor-pointer"
            >
              <span>{section.label}</span>
              <Icon name="ChevronDown" className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </Link>

            {/* Megamenu dropdown panel */}
            <div
              className={`absolute top-[100%] left-0 ${
                isWide ? 'w-[680px]' : 'w-[450px]'
              } bg-card/95 backdrop-blur-md border border-border/80 rounded-lg shadow-2xl p-6 grid ${
                isWide ? 'grid-cols-3' : 'grid-cols-2'
              } gap-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-[1000]`}
            >
              <div className={`${isWide ? 'col-span-2 grid grid-cols-2' : 'col-span-1 flex flex-col'} gap-6`}>
                {section.groups?.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex flex-col gap-2.5">
                    <Text className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
                      {group.title}
                    </Text>
                    <div className="flex flex-col gap-1.5">
                      {group.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="text-xs font-medium text-foreground/90 hover:text-primary transition-colors py-0.5 cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {section.featured && (
                <Link
                  href={section.featured.href}
                  className="col-span-1 flex flex-col gap-2 rounded-md overflow-hidden bg-muted/40 hover:opacity-95 transition-all border border-border/60 group/feat cursor-pointer p-1"
                >
                  <div className="overflow-hidden rounded-sm h-36 w-full">
                    <img
                      src={section.featured.imageUrl}
                      alt={section.featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/feat:scale-105"
                    />
                  </div>
                  <div className="p-2.5 flex flex-col gap-1">
                    <Text className="text-xs font-extrabold uppercase tracking-wide text-foreground line-clamp-1">
                      {section.featured.title}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {section.featured.description}
                    </Text>
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">
                      {section.featured.actionLabel} &rarr;
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
export default DesktopNav;
