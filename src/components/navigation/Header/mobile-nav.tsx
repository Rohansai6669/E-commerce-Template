'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/core/utils/cn';
import { NavAppearanceConfig } from '@/types/navigation-appearance';
import { useNavAppearance } from '@/hooks/use-nav-appearance';
import { ChevronDown, ChevronRight, X, User, Heart, ShoppingBag } from 'lucide-react';
import { FALLBACK_MEGAMENU_DATA, MegamenuCollection } from './megamenu-panel';
import { getStorefrontNavigationAction } from '@/app/actions/navigation-actions';

export interface MobileNavProps {
  appearance?: NavAppearanceConfig;
}

/**
 * High-performance mobile navigation drawer.
 * Uses React Portal to mount directly into document.body, ensuring it is NEVER
 * trapped by parent container transforms, filters, or backdrop-blur styling.
 */
export function MobileNav({ appearance }: MobileNavProps) {
  const { navConfig } = useNavAppearance(appearance);
  const config = appearance || navConfig;

  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedLinkId, setExpandedLinkId] = React.useState<string | null>(null);
  const [collectionsCache, setCollectionsCache] = React.useState<Record<string, MegamenuCollection[]>>({});

  const links = config?.links || [];

  // Ensure portal only mounts on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scrolling when mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close drawer on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const drawerPortal = mounted ? (
    createPortal(
      <div
        data-mobile-nav-root="true"
        className={cn(
          'fixed inset-0 z-[99990] transition-all duration-300',
          isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        )}
      >
        {/* Full Viewport Dark Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Luxury Drawer Container */}
        <div
          className={cn(
            'fixed top-0 bottom-0 right-0 z-[99995] w-[88vw] sm:w-[380px] max-w-[420px] h-[100dvh] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-out',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header with Brand Logo & Touch-Friendly Close Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider uppercase font-heading text-slate-950 dark:text-white">
                {config?.logoText || 'LEXIDO'}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Storefront
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Scrollable Body */}
          <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4 flex-1">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-slate-400">
                Department & Collections
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isExpanded = expandedLinkId === (link.id || link.label);
                const collections =
                  collectionsCache[link.label.toUpperCase()] ||
                  FALLBACK_MEGAMENU_DATA[link.label.toUpperCase()] ||
                  FALLBACK_MEGAMENU_DATA.MEN;

                return (
                  <div
                    key={link.id || link.label}
                    className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30"
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

          {/* Footer Shortcuts */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>My Account</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <Heart className="w-4 h-4 text-slate-500" />
              <span>Saved Wishlist</span>
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>Shopping Bag</span>
            </Link>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="lg:hidden flex items-center">
      {/* Trigger Button in Header */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open mobile navigation menu"
        className="cursor-pointer h-10 w-10 text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Icon name="Menu" className="h-6 w-6" />
      </Button>

      {/* Portal Mounted Drawer */}
      {drawerPortal}
    </div>
  );
}

export default MobileNav;
