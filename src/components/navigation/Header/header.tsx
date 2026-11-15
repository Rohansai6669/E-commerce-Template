'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { Search } from './search';
import { CartButton } from './cart-button';
import { ProfileMenu } from './profile-menu';
import { MegamenuPanel } from './megamenu-panel';
import { X, Heart, ChevronDown } from 'lucide-react';
import {
  NavAppearanceConfig,
  defaultNavAppearanceConfig,
  DEFAULT_NAV_LINKS,
} from '@/types/navigation-appearance';
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
 * Supports transparent-to-sticky scroll transition, custom color palettes,
 * and live editing from Visual Studio & Admin CMS.
 */
export function Header({
  previewConfig,
  previewActiveCategory,
  onPreviewCategoryChange,
  className = '',
}: HeaderProps) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  const { navConfig: liveConfig } = useNavAppearance(previewConfig);
  const config = previewConfig || liveConfig || defaultNavAppearanceConfig;

  const [internalActiveCategory, setInternalActiveCategory] = React.useState<string | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const activeCategory =
    previewActiveCategory !== undefined ? previewActiveCategory : internalActiveCategory;

  const handleCategoryChange = (category: string | null) => {
    if (onPreviewCategoryChange) {
      onPreviewCategoryChange(category);
    } else {
      setInternalActiveCategory(category);
    }
  };

  // Scroll listener for dynamic transparent-to-sticky behavior
  React.useEffect(() => {
    const threshold = config.scrollThresholdPx || 30;
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(currentScrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.scrollThresholdPx]);

  // Exact Height Control
  const headerHeight =
    config.headerHeightPx ||
    (config.height === 'compact'
      ? 56
      : config.height === 'luxury'
      ? 88
      : config.customHeightPx || 72);

  const widthClass = WIDTH_CLASS_MAP[config.maxWidth] || WIDTH_CLASS_MAP.wide;

  // Pre-Layout & Scroll Behavior Calculation
  const scrollBehavior = config.scrollBehavior || 'transparent-to-sticky';
  const transparentOnlyOnHomepage = config.transparentOnlyOnHomepage ?? true;
  const isMegamenuOpen = Boolean(activeCategory);

  const isTransparentTop =
    (scrollBehavior === 'transparent-to-sticky' &&
      !isScrolled &&
      !isMegamenuOpen &&
      (!transparentOnlyOnHomepage || isHomepage)) ||
    (scrollBehavior === 'always-transparent' && !isMegamenuOpen);

  // Compute Scrolled Color Palette
  const getScrolledPaletteColors = () => {
    const palette = config.scrolledBgPalette || 'theme-palette';
    switch (palette) {
      case 'black':
        return {
          bg: '#000000',
          text: '#ffffff',
          border: '#262626',
          logo: '#ffffff',
          iconHover: 'hover:bg-white/10',
        };
      case 'white':
        return {
          bg: '#ffffff',
          text: '#0a0a0a',
          border: '#e5e5e5',
          logo: '#0a0a0a',
          iconHover: 'hover:bg-black/5',
        };
      case 'glass-dark':
        return {
          bg: 'rgba(0, 0, 0, 0.82)',
          text: '#ffffff',
          border: 'rgba(255, 255, 255, 0.12)',
          logo: '#ffffff',
          iconHover: 'hover:bg-white/10',
        };
      case 'glass-light':
        return {
          bg: 'rgba(255, 255, 255, 0.88)',
          text: '#0a0a0a',
          border: 'rgba(0, 0, 0, 0.08)',
          logo: '#0a0a0a',
          iconHover: 'hover:bg-black/5',
        };
      case 'custom':
        return {
          bg: config.scrolledCustomBgColor || config.backgroundColor || '#000000',
          text: config.scrolledCustomTextColor || config.textColor || '#ffffff',
          border: config.scrolledCustomBorderColor || config.borderColor || '#262626',
          logo: config.scrolledCustomTextColor || config.logoColor || '#ffffff',
          iconHover: 'hover:bg-current/10',
        };
      case 'theme-palette':
      default:
        return {
          bg: config.backgroundColor || '#ffffff',
          text: config.textColor || '#0f172a',
          border: config.borderColor || '#e2e8f0',
          logo: config.logoColor || config.textColor || '#0f172a',
          iconHover: 'hover:bg-black/5 dark:hover:bg-white/10',
        };
    }
  };

  const scrolledPalette = getScrolledPaletteColors();

  // Active current color states
  let currentBgColor: string;
  let currentTextColor: string;
  let currentBorderColor: string;
  let currentLogoColor: string;

  if (isMegamenuOpen) {
    currentBgColor = config.megaMenuBgColor || '#ffffff';
    currentTextColor = config.megaMenuTextColor || '#0f172a';
    currentBorderColor = config.megaMenuBorderColor || '#e2e8f0';
    currentLogoColor = config.megaMenuTextColor || '#0f172a';
  } else if (isTransparentTop) {
    currentBgColor = 'transparent';
    currentTextColor = config.initialTextColor || '#ffffff';
    currentBorderColor = 'transparent';
    currentLogoColor = config.initialLogoColor || config.initialTextColor || '#ffffff';
  } else {
    currentBgColor = scrolledPalette.bg;
    currentTextColor = scrolledPalette.text;
    currentBorderColor = scrolledPalette.border;
    currentLogoColor = scrolledPalette.logo;
  }

  // Navigation Links Styling
  const linksAlignClass = ALIGN_CLASS_MAP[config.linksAlignment] || 'justify-center';
  const linksSpacingClass = SPACING_CLASS_MAP[config.linksSpacing] || 'gap-7';
  const linksFontSizeClass = FONT_SIZE_MAP[config.linksFontSize] || 'text-xs';
  const linksFontWeightClass = FONT_WEIGHT_MAP[config.linksFontWeight] || 'font-bold';
  const linksTransformClass = TRANSFORM_MAP[config.linksTextTransform] || 'uppercase';
  const linksTrackingClass = TRACKING_MAP[config.linksLetterSpacing] || 'tracking-[0.2em]';

  // Hover Effect Class Generator
  const getLinkHoverClasses = () => {
    switch (config.linksHoverEffect) {
      case 'underline':
        return 'relative py-1 group/link after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current hover:after:w-full after:transition-all after:duration-200';
      case 'pill':
        return 'px-3 py-1.5 rounded-full hover:bg-current/10 transition-colors';
      case 'color-shift':
        return 'py-1 hover:opacity-100 transition-colors';
      case 'glow':
        return 'py-1 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all';
      case 'opacity':
      default:
        return 'py-1 hover:opacity-70 transition-opacity';
    }
  };

  // Border Style & Width Computation
  const getHeaderBorderBottom = () => {
    if (isTransparentTop) {
      return '1px solid transparent';
    }
    const borderStyle = config.headerBorderStyle || (config.borderBottom !== false ? 'solid' : 'none');
    if (borderStyle === 'none' || config.borderBottom === false) {
      return 'none';
    }
    const width = config.headerBorderWidth || '1px';
    if (borderStyle === 'dashed') {
      return `${width} dashed ${currentBorderColor}`;
    }
    if (borderStyle === 'subtle-glass') {
      return `${width} solid ${currentBorderColor.includes('rgba') ? currentBorderColor : 'rgba(255, 255, 255, 0.12)'}`;
    }
    return `${width} solid ${currentBorderColor}`;
  };

  // Action Icon Button Styles (Controlled border: none vs rounded vs square)
  const iconBorderOpt = config.actionIconBorderStyle || (config.iconStyle === 'minimal' ? 'none' : config.iconStyle || 'none');
  const actionIconClass =
    iconBorderOpt === 'rounded-button'
      ? 'relative flex items-center justify-center h-9 w-9 rounded-full border border-current/25 hover:border-current bg-transparent hover:bg-current/10 transition-colors cursor-pointer text-current select-none'
      : iconBorderOpt === 'square-button'
      ? 'relative flex items-center justify-center h-9 w-9 rounded-none border border-current/25 hover:border-current bg-transparent hover:bg-current/10 transition-colors cursor-pointer text-current select-none'
      : iconBorderOpt === 'minimal-pill'
      ? 'relative flex items-center justify-center px-3 h-9 rounded-full border border-current/25 hover:border-current bg-transparent hover:bg-current/10 transition-colors cursor-pointer text-current select-none'
      : 'relative flex items-center justify-center h-9 w-9 rounded-none border-none bg-transparent hover:bg-current/10 transition-colors cursor-pointer text-current select-none';
  const iconButtonStyle = actionIconClass;

  // Determine container positioning: sticky vs fixed vs relative
  const isAdminOrDashboard =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/supplier') ||
    pathname?.startsWith('/account');

  // Fixed layout is strictly reserved for transparent hero overlay at top of homepage
  // (never on admin, supplier, or non-transparent subpages to prevent content overlapping)
  const isFixedLayout =
    !isAdminOrDashboard &&
    ((scrollBehavior === 'transparent-to-sticky' && (!transparentOnlyOnHomepage || isHomepage)) ||
      scrollBehavior === 'always-transparent');

  const containerPositionClass = isFixedLayout
    ? 'fixed top-0 inset-x-0 z-[1010]'
    : config.isSticky !== false
    ? 'sticky top-0 z-[1010]'
    : 'relative z-30';

  // Guaranteed fallback links
  const navLinks =
    config.links && config.links.length > 0 ? config.links : DEFAULT_NAV_LINKS;

  return (
    <div
      suppressHydrationWarning
      className={`w-full ${containerPositionClass} ${className} transition-all duration-300`}
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
          borderBottom: getHeaderBorderBottom(),
        }}
        className={`w-full transition-all duration-300 ease-in-out select-none ${
          (config.translucentBlur ||
            config.scrolledBgPalette === 'glass-dark' ||
            config.scrolledBgPalette === 'glass-light') &&
          !isTransparentTop
            ? 'backdrop-blur-md'
            : ''
        } ${!isTransparentTop && isScrolled ? 'shadow-sm' : ''}`}
        onMouseLeave={() => {
          if (previewActiveCategory === undefined) {
            handleCategoryChange(null);
          }
        }}
      >
        <div
          style={{ height: `${headerHeight}px` }}
          className={`relative flex items-center justify-between gap-4 ${widthClass}`}
        >
          {/* ======================================================== */}
          {/* MOBILE VIEW (lg:hidden): Hamburger Menu on Left          */}
          {/* ======================================================== */}
          <div className="flex lg:hidden items-center shrink-0 z-10">
            <MobileNav appearance={config} />
          </div>

          {/* ======================================================== */}
          {/* Centered Brand Logo on Mobile                             */}
          {/* ======================================================== */}
          <div className="flex lg:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center pointer-events-auto">
            <Logo
              type={config.logoType}
              text={config.logoText}
              font={config.logoFont}
              fontSize={config.logoFontSize || 'xl'}
              fontWeight={config.logoFontWeight}
              letterSpacing={config.logoLetterSpacing}
              color={currentLogoColor}
              imageUrl={config.logoImageUrl}
              imageHeight={config.logoImageHeight}
            />
          </div>

          {/* ======================================================== */}
          {/* DESKTOP VIEW (hidden lg:flex): Left Brand Logo           */}
          {/* ======================================================== */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <Logo
              type={config.logoType}
              text={config.logoText}
              font={config.logoFont}
              fontSize={config.logoFontSize}
              fontWeight={config.logoFontWeight}
              letterSpacing={config.logoLetterSpacing}
              color={currentLogoColor}
              imageUrl={config.logoImageUrl}
              imageHeight={config.logoImageHeight}
            />
          </div>

          {/* ======================================================== */}
          {/* Center: ALL Navigation Links (Always Rendered & Visible)  */}
          {/* ======================================================== */}
          <div className={`hidden lg:flex items-center flex-1 h-full ${linksAlignClass}`}>
            <nav className={`flex items-center h-full ${linksSpacingClass}`} suppressHydrationWarning>
              {navLinks.map((item) => {
                const hoverClasses = getLinkHoverClasses();
                const isItemActive = isMegamenuOpen && activeCategory === item.label;

                if (item.hasMega) {
                  return (
                    <button
                      type="button"
                      suppressHydrationWarning
                      key={item.id || item.label}
                      onMouseEnter={() => handleCategoryChange(item.label)}
                      onClick={() => handleCategoryChange(item.label)}
                      style={{
                        color: isItemActive
                          ? config.activeTextColor || currentTextColor
                          : currentTextColor,
                      }}
                      className={`${linksFontSizeClass} ${linksFontWeightClass} ${linksTrackingClass} ${linksTransformClass} ${hoverClasses} cursor-pointer flex items-center gap-1 group transition-colors relative py-1 ${
                        isItemActive ? 'font-black after:w-full opacity-100' : 'opacity-90'
                      }`}
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
                      <ChevronDown
                        className={`w-3 h-3 opacity-60 transition-transform ${
                          isItemActive ? 'rotate-180 opacity-100' : 'group-hover:rotate-180'
                        }`}
                      />
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
                    className={`${linksFontSizeClass} ${linksFontWeightClass} ${linksTrackingClass} ${linksTransformClass} ${hoverClasses} flex items-center gap-1.5 transition-colors relative py-1`}
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
          </div>

          {/* ======================================================== */}
          {/* Right: Actions (Search, Account, Wishlist, Cart, Close)   */}
          {/* ======================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-10" style={{ color: currentTextColor }}>
            {config.showSearch !== false && (
              <React.Suspense fallback={null}>
                <Search className={actionIconClass} />
              </React.Suspense>
            )}

            {/* Desktop Only: ProfileMenu and Wishlist */}
            {config.showAccount !== false && (
              <div className="hidden lg:flex">
                <ProfileMenu
                  buttonType={config.accountButtonType || 'icon'}
                  iconStyleClass={actionIconClass}
                />
              </div>
            )}

            {config.showWishlist !== false && (
              <Link
                href="/account/wishlist"
                className={`hidden lg:flex ${actionIconClass}`}
                aria-label="View Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>
            )}

            {/* Cart Button: Visible on mobile and desktop */}
            {config.showCart !== false && (
              <CartButton
                badgeBgColor={config.cartBadgeBgColor}
                badgeTextColor={config.cartBadgeTextColor}
                className={actionIconClass}
              />
            )}

            {/* Close button if Megamenu is open on desktop */}
            {isMegamenuOpen && (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => handleCategoryChange(null)}
                style={{
                  borderColor: currentBorderColor,
                  color: currentTextColor,
                }}
                className="hidden lg:flex items-center justify-center h-9 w-9 rounded-full border transition-colors cursor-pointer ml-1 hover:opacity-80"
                aria-label="Close megamenu"
              >
                <X className="h-5 w-5" />
              </button>
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
