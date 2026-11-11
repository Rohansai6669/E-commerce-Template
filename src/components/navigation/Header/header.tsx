'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { Search } from './search';
import { CartButton } from './cart-button';
import { ProfileMenu } from './profile-menu';
import { MegamenuPanel } from './megamenu-panel';
import { X, Heart, ChevronDown } from 'lucide-react';
import { NavAppearanceConfig, defaultNavAppearanceConfig } from '@/types/navigation-appearance';
import { useNavAppearance } from '@/hooks/use-nav-appearance';

export interface HeaderProps {
  previewConfig?: NavAppearanceConfig;
  previewActiveCategory?: string | null;
  onPreviewCategoryChange?: (category: string | null) => void;
  className?: string;
}

const WIDTH_CLASS_MAP: Record<string, string> = {
  boxed: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14',
  full: 'w-full px-4 sm:px-8 lg:px-12',
};

const ALIGN_CLASS_MAP: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const SPACING_CLASS_MAP: Record<string, string> = {
  compact: 'gap-4',
  normal: 'gap-7',
  wide: 'gap-10',
};

const FONT_SIZE_MAP: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const TRANSFORM_MAP: Record<string, string> = {
  uppercase: 'uppercase',
  capitalize: 'capitalize',
  none: 'normal-case',
};

const TRACKING_MAP: Record<string, string> = {
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  widest: 'tracking-widest',
  'ultra-wide': 'tracking-[0.2em]',
};

/**
 * Storefront Header component with full appearance control.
 * Supports live editing from the Visual Studio Builder.
 */
export function Header({
  previewConfig,
  previewActiveCategory,
  onPreviewCategoryChange,
  className = '',
}: HeaderProps) {
  const { navConfig: liveConfig } = useNavAppearance(previewConfig);
  const config = previewConfig || liveConfig || defaultNavAppearanceConfig;

  const [internalActiveCategory, setInternalActiveCategory] = React.useState<string | null>(null);

  const activeCategory =
    previewActiveCategory !== undefined ? previewActiveCategory : internalActiveCategory;

  const handleCategoryChange = (category: string | null) => {
    if (onPreviewCategoryChange) {
      onPreviewCategoryChange(category);
    } else {
      setInternalActiveCategory(category);
    }
  };

  // Exact Height Control
  const headerHeight =
    config.headerHeightPx ||
    (config.height === 'compact'
      ? 56
      : config.height === 'luxury'
      ? 88
      : config.customHeightPx || 72);

  const widthClass = WIDTH_CLASS_MAP[config.maxWidth] || WIDTH_CLASS_MAP.wide;

  // Header Colors & Background
  const isMegamenuOpen = Boolean(activeCategory);
  const currentBgColor = isMegamenuOpen
    ? config.megaMenuBgColor || '#ffffff'
    : config.backgroundColor || '#ffffff';

  const currentTextColor = isMegamenuOpen
    ? config.megaMenuTextColor || '#0f172a'
    : config.textColor || '#0f172a';

  const currentBorderColor = isMegamenuOpen
    ? config.megaMenuBorderColor || '#e2e8f0'
    : config.borderColor || '#e2e8f0';

  // Navigation Links Styling
  const linksAlignClass = ALIGN_CLASS_MAP[config.linksAlignment] || 'justify-center';
  const linksSpacingClass = SPACING_CLASS_MAP[config.linksSpacing] || 'gap-7';
  const linksFontSizeClass = FONT_SIZE_MAP[config.linksFontSize] || 'text-xs';
  const linksFontWeightClass = FONT_WEIGHT_MAP[config.linksFontWeight] || 'font-bold';
  const linksTransformClass = TRANSFORM_MAP[config.linksTextTransform] || 'uppercase';
  const linksTrackingClass = TRACKING_MAP[config.linksLetterSpacing] || 'tracking-[0.2em]';

  // Links Hover Effect Class Generator
  const getLinkHoverClasses = () => {
    switch (config.linksHoverEffect) {
      case 'underline':
        return 'relative py-1 group/link after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current hover:after:w-full after:transition-all after:duration-200';
      case 'pill':
        return 'px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors';
      case 'color-shift':
        return 'py-1 hover:opacity-100 transition-colors';
      case 'glow':
        return 'py-1 hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.25)] transition-all';
      case 'opacity':
      default:
        return 'py-1 hover:opacity-60 transition-opacity';
    }
  };

  // Icon Button Styles
  const iconButtonStyle =
    config.iconStyle === 'minimal'
      ? 'relative flex items-center justify-center h-9 w-9 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
      : config.iconStyle === 'square-button'
      ? 'relative flex items-center justify-center h-9 w-9 rounded-lg border transition-colors cursor-pointer'
      : 'relative flex items-center justify-center h-9 w-9 rounded-full border transition-colors cursor-pointer';

  return (
    <div
      suppressHydrationWarning
      className={`w-full ${config.isSticky ? 'sticky top-0 z-[1010]' : 'relative z-30'} ${className}`}
    >
      {/* 1. Optional Top Announcement Bar Companion */}
      {config.showAnnouncementBar && (
        <aside
          aria-label="Store Announcement"
          suppressHydrationWarning
          style={{
            backgroundColor: config.announcementBgColor || '#000000',
            color: config.announcementTextColor || '#ffffff',
          }}
          className="w-full py-2 px-4 text-xs font-semibold tracking-wider uppercase flex items-center justify-center text-center transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>{config.announcementMessage}</span>
            {config.announcementCtaText && (
              <Link
                href={config.announcementCtaUrl || '/products'}
                className="ml-2 underline font-bold hover:opacity-80 transition-opacity"
              >
                {config.announcementCtaText}
              </Link>
            )}
          </div>
        </aside>
      )}

      {/* 2. Main Navigation Header Bar */}
      <header
        suppressHydrationWarning
        style={{
          backgroundColor: currentBgColor,
          color: currentTextColor,
          borderBottom: config.borderBottom ? `1px solid ${currentBorderColor}` : 'none',
        }}
        className={`w-full transition-colors duration-200 select-none ${
          config.translucentBlur && !isMegamenuOpen ? 'backdrop-blur-md' : ''
        }`}
        onMouseLeave={() => {
          if (previewActiveCategory === undefined) {
            handleCategoryChange(null);
          }
        }}
      >
        <div
          style={{ height: `${headerHeight}px` }}
          className={`flex items-center justify-between gap-4 ${widthClass}`}
        >
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8 shrink-0">
            <Logo
              type={config.logoType}
              text={config.logoText}
              font={config.logoFont}
              fontSize={config.logoFontSize}
              fontWeight={config.logoFontWeight}
              letterSpacing={config.logoLetterSpacing}
              color={config.logoColor}
              imageUrl={config.logoImageUrl}
              imageHeight={config.logoImageHeight}
            />
          </div>

          {/* Center: Dynamic Category & Section Navigation Links */}
          <div className={`hidden lg:flex items-center flex-1 h-full ${linksAlignClass}`}>
            {isMegamenuOpen ? (
              /* When Megamenu is open: Display Active Department Label */
              <div className="flex items-center gap-2">
                <span
                  style={{ color: config.activeTextColor || currentTextColor }}
                  className="text-xs font-black tracking-[0.3em] uppercase font-heading"
                >
                  {activeCategory}
                </span>
              </div>
            ) : (
              /* Standard Configurable Navigation Links */
              <nav className={`flex items-center h-full ${linksSpacingClass}`} suppressHydrationWarning>
                {(config.links || []).map((item) => {
                  const hoverClasses = getLinkHoverClasses();

                  if (item.hasMega) {
                    return (
                      <button
                        type="button"
                        suppressHydrationWarning
                        key={item.id || item.label}
                        onMouseEnter={() => handleCategoryChange(item.label)}
                        onClick={() => handleCategoryChange(item.label)}
                        style={{ color: currentTextColor }}
                        className={`${linksFontSizeClass} ${linksFontWeightClass} ${linksTrackingClass} ${linksTransformClass} ${hoverClasses} cursor-pointer flex items-center gap-1 group`}
                      >
                        <span>{item.label}</span>
                        {item.badgeText && (
                          <span
                            style={{
                              backgroundColor: item.badgeColor || '#4f46e5',
                              color: '#ffffff',
                            }}
                            className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ml-1"
                          >
                            {item.badgeText}
                          </span>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-60 transition-transform group-hover:rotate-180" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id || item.label}
                      href={item.href}
                      style={{
                        color: item.highlight
                          ? config.activeTextColor || '#4f46e5'
                          : currentTextColor,
                      }}
                      className={`${linksFontSizeClass} ${linksFontWeightClass} ${linksTrackingClass} ${linksTransformClass} ${hoverClasses} flex items-center gap-1.5`}
                    >
                      <span>{item.label}</span>
                      {item.badgeText && (
                        <span
                          style={{
                            backgroundColor: item.badgeColor || '#4f46e5',
                            color: '#ffffff',
                          }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                        >
                          {item.badgeText}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right: Actions (Search, Account, Wishlist, Cart, Megamenu Close) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {config.showSearch !== false && (
              <React.Suspense fallback={null}>
                <Search />
              </React.Suspense>
            )}

            {config.showAccount !== false && <ProfileMenu />}

            {config.showWishlist !== false && (
              <Link
                href="/account/wishlist"
                style={{
                  borderColor: currentBorderColor,
                  color: currentTextColor,
                }}
                className={`hidden sm:flex ${iconButtonStyle}`}
                aria-label="View Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>
            )}

            {config.showCart !== false && (
              <CartButton
                badgeBgColor={config.cartBadgeBgColor}
                badgeTextColor={config.cartBadgeTextColor}
                className={iconButtonStyle}
              />
            )}

            {/* Close button if Megamenu is open */}
            {isMegamenuOpen ? (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => handleCategoryChange(null)}
                style={{
                  borderColor: currentBorderColor,
                  color: currentTextColor,
                }}
                className={`flex items-center justify-center h-9 w-9 rounded-full border transition-colors cursor-pointer ml-1 hover:opacity-80`}
                aria-label="Close megamenu"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <MobileNav appearance={config} />
            )}
          </div>
        </div>

        {/* 3. Full-width Megamenu Dropdown Overlay */}
        {isMegamenuOpen && (
          <MegamenuPanel
            category={activeCategory || 'MEN'}
            onClose={() => handleCategoryChange(null)}
            appearance={config}
          />
        )}
      </header>
    </div>
  );
}

export default Header;
