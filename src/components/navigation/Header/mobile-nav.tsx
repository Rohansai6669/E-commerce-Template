'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/core/utils/cn';
import { NavAppearanceConfig } from '@/types/navigation-appearance';
import { useNavAppearance } from '@/hooks/use-nav-appearance';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FALLBACK_MEGAMENU_DATA, MegamenuCollection } from './megamenu-panel';
import { getStorefrontNavigationAction } from '@/app/actions/navigation-actions';

export interface MobileNavProps {
  appearance?: NavAppearanceConfig;
}

/**
 * Enhanced Mobile navigation drawer with full mobile responsiveness,
 * touch-optimized category accordion, and category image thumbnails.
 */
export function MobileNav({ appearance }: MobileNavProps) {
  const { navConfig } = useNavAppearance(appearance);
  const config = appearance || navConfig;

  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedLinkId, setExpandedLinkId] = React.useState<string | null>(null);
  const [collectionsCache, setCollectionsCache] = React.useState<Record<string, MegamenuCollection[]>>({});

  const links = config?.links || [];

  // Prevent body scrolling when mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load mega menu collections for expanded category
  const toggleLinkAccordion = async (linkId: string, label: string) => {
    if (expandedLinkId === linkId) {
      setExpandedLinkId(null);
      return;
    }

    setExpandedLinkId(linkId);

    const key = label.toUpperCase();
    if (!collectionsCache[key]) {
      try {
        const dbNav = await getStorefrontNavigationAction(key);
        if (dbNav && dbNav.length > 0) {
          setCollectionsCache((prev) => ({ ...prev, [key]: dbNav as MegamenuCollection[] }));
          return;
        }
      } catch (err) {
        console.warn('Mobile nav DB fetch error:', err);
      }
      // Fallback
      const fb = FALLBACK_MEGAMENU_DATA[key] || FALLBACK_MEGAMENU_DATA.MEN;
      setCollectionsCache((prev) => ({ ...prev, [key]: fb }));
    }
  };

  return (
    <div className="lg:hidden flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
        className="cursor-pointer h-10 w-10 text-slate-900 dark:text-white"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} className="h-6 w-6" />
      </Button>

      {/* Backdrop with fade-in blur */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[var(--header-height,4.5rem)] z-[1020] bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed top-[var(--header-height,4.5rem)] right-0 z-[1020] h-[calc(100vh-var(--header-height,4.5rem))] w-full max-w-[340px] sm:max-w-sm bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-5 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Navigation Scrollable Body */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
          <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-slate-400">
              Department & Collections
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
              Mobile Storefront
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isExpanded = expandedLinkId === (link.id || link.label);
              const collections = collectionsCache[link.label.toUpperCase()] || FALLBACK_MEGAMENU_DATA[link.label.toUpperCase()] || FALLBACK_MEGAMENU_DATA.MEN;

              return (
                <div
                  key={link.id || link.label}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-slate-50/40 dark:bg-slate-900/30"
                >
                  <div className="flex items-center justify-between p-1.5">
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 flex items-center justify-between text-xs font-black tracking-wider py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors uppercase ${
                        link.highlight
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-950 dark:text-slate-100'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badgeText && (
                        <span
                          style={{
                            backgroundColor: link.badgeColor || '#4f46e5',
                            color: '#ffffff',
                          }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ml-2"
                        >
                          {link.badgeText}
                        </span>
                      )}
                    </Link>

                    {/* Accordion expand button for links with Mega Menu */}
                    {link.hasMega && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => toggleLinkAccordion(link.id || link.label, link.label)}
                        className="p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        aria-label={`Expand ${link.label} categories`}
                      >
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isExpanded && 'rotate-180 text-indigo-600'
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Nested Subcategories with Category Thumbnails */}
                  {link.hasMega && isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                        Categories & Curations
                      </span>

                      <div className="flex flex-col gap-1.5">
                        {collections.slice(0, 6).map((col) => (
                          <Link
                            key={col.id}
                            href={col.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-slate-400 transition"
                          >
                            {col.featured?.imageUrl ? (
                              <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                                <Image
                                  src={col.featured.imageUrl}
                                  alt={col.name}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                📁
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">
                                {col.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {col.subitems?.length || 0} subcategories
                              </p>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <Icon name="User" className="w-4 h-4 text-slate-500" />
            <span>My Account</span>
          </Link>
          <Link
            href="/account/wishlist"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <Icon name="Heart" className="w-4 h-4 text-slate-500" />
            <span>Saved Wishlist</span>
          </Link>
          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <Icon name="ShoppingBag" className="w-4 h-4 text-slate-500" />
            <span>Shopping Bag</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
