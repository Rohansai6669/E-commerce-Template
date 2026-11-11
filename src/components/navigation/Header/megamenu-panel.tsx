'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getStorefrontNavigationAction } from '@/app/actions/navigation-actions';
import { NavAppearanceConfig } from '@/types/navigation-appearance';
import { useNavAppearance } from '@/hooks/use-nav-appearance';
import { getNineAlignmentClasses } from '@/components/ui/nine-alignment-matrix';

export interface MegamenuSubitem {
  label: string;
  href: string;
  columnNumber?: number;
}

export interface MegamenuCollection {
  id: string;
  name: string;
  href: string;
  subitems: MegamenuSubitem[];
  featured: {
    title: string;
    imageUrl: string;
    href: string;
    actionLabel?: string;
  };
}

export const FALLBACK_MEGAMENU_DATA: Record<string, MegamenuCollection[]> = {
  MEN: [
    {
      id: 'streetwear',
      name: 'STREETWEAR',
      href: '/products?category=streetwear',
      subitems: [
        { label: 'Oversized T-Shirts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Graphic T-Shirts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Oversized Hoodies', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Zip Hoodies', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Wide-Leg Jeans', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Utility Pants', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Denim Jackets', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Varsity Jackets', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Shorts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Heavyweight T-Shirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Long Sleeve T-Shirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Sweatshirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Baggy Jeans', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Cargo Pants', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Joggers', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Bomber Jackets', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Overshirts', href: '/products?category=streetwear', columnNumber: 2 },
      ],
      featured: {
        title: 'STREETWEAR',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=streetwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'gymwear',
      name: 'GYM WEAR',
      href: '/products?category=gymwear',
      subitems: [
        { label: 'Signature Gym Set', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Surge Training Joggers', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Iron Stringer Tank', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Apex Dry-Fit Tee', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Drop Armhole Tanks', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Velocity Compression Top', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Heavyweight Fleece Shorts', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Seamless Base Layers', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Lifting Straps & Wraps', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Performance Zip Jackets', href: '/products?category=gymwear', columnNumber: 2 },
      ],
      featured: {
        title: 'GYM WEAR',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=gymwear',
        actionLabel: 'EXPLORE ATHLETICS',
      },
    },
    {
      id: 'oldmoney',
      name: 'OLD MONEY',
      href: '/products?category=old-money',
      subitems: [
        { label: 'Oxford Cotton Shirts', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Cashmere Crewnecks', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Cable Knit Sweaters', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'French Linen Trousers', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Double-Breasted Blazers', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Tailored Pleated Chinos', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Italian Suede Loafers', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Classic Trench Coats', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Mulberry Silk Ties', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Leather Driving Gloves', href: '/products?category=old-money', columnNumber: 2 },
      ],
      featured: {
        title: 'OLD MONEY',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=old-money',
        actionLabel: 'DISCOVER SARTORIAL',
      },
    },
    {
      id: 'casual',
      name: 'CASUAL',
      href: '/products?category=casual',
      subitems: [
        { label: 'Everyday Crewneck Tees', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Pique Polo Shirts', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Washed Denim Overshirts', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Waffle Long Sleeve Tops', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Relaxed Fit Chinos', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Straight Leg Denim Jeans', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Casual Field Jackets', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Minimalist Canvas Sneakers', href: '/products?category=casual', columnNumber: 2 },
      ],
      featured: {
        title: 'CASUAL',
        imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=casual',
        actionLabel: 'EXPLORE DAILY',
      },
    },
    {
      id: 'formal',
      name: 'FORMAL',
      href: '/products?category=formal',
      subitems: [
        { label: 'Structured Two-Piece Suits', href: '/products?category=formal', columnNumber: 1 },
        { label: 'French Cuff Dress Shirts', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Sartorial Tuxedo Jackets', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Slim Fit Tuxedo Trousers', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Pure Wool Dress Trousers', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Handcrafted Oxford Shoes', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Silk Bow Ties & Cummerbunds', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Engraved Silver Cufflinks', href: '/products?category=formal', columnNumber: 2 },
      ],
      featured: {
        title: 'FORMAL',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=formal',
        actionLabel: 'SHOP TAILORING',
      },
    },
    {
      id: 'winter',
      name: 'WINTER COLLECTION',
      href: '/products?category=winter',
      subitems: [
        { label: 'Heavy Down Puffer Jackets', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Cashmere Wool Overcoats', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Thermal Merino Base Layers', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Sherpa-Lined Corduroy Jackets', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Fleece Lined Joggers', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Ribbed Cashmere Beanies', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Heavyweight Wool Scarves', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Insulated Arctic Parkas', href: '/products?category=winter', columnNumber: 2 },
      ],
      featured: {
        title: 'WINTER COLLECTION',
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=winter',
        actionLabel: 'EXPLORE WINTER',
      },
    },
    {
      id: 'accessories',
      name: "MEN'S ACCESSORIES",
      href: '/products?category=accessories',
      subitems: [
        { label: 'Full-Grain Leather Duffle Bags', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Minimalist Automatic Watches', href: '/products?category=accessories', columnNumber: 1 },
        { label: '925 Sterling Silver Chains', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Polarized Aviator Sunglasses', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Structured Wool Snapbacks', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'Full Grain Italian Belts', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'RFID Blocking Cardholders', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'Atelier Leather Wallets', href: '/products?category=accessories', columnNumber: 2 },
      ],
      featured: {
        title: "MEN'S ACCESSORIES",
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=accessories',
        actionLabel: 'SHOP ACCESSORIES',
      },
    },
  ],
};

const RADIUS_MAP: Record<string, string> = {
  none: 'rounded-none',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

const POSITION_MAP: Record<string, string> = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right',
};

const PADDING_Y_MAP: Record<string, string> = {
  compact: 'py-4',
  standard: 'py-8',
  relaxed: 'py-12',
};

const CATEGORY_GAP_MAP: Record<string, string> = {
  compact: 'space-y-2',
  standard: 'space-y-3.5',
  relaxed: 'space-y-5',
};

const SUBITEM_GAP_MAP: Record<string, string> = {
  compact: 'space-y-2',
  standard: 'space-y-3',
  relaxed: 'space-y-4.5',
};

interface MegamenuPanelProps {
  category: string;
  onClose: () => void;
  appearance?: NavAppearanceConfig;
}

export function MegamenuPanel({ category, onClose, appearance }: MegamenuPanelProps) {
  const { navConfig: liveConfig } = useNavAppearance(appearance);
  const config = appearance || liveConfig;

  const fallback = FALLBACK_MEGAMENU_DATA[category.toUpperCase()] || FALLBACK_MEGAMENU_DATA.MEN;
  const [collections, setCollections] = useState<MegamenuCollection[]>(fallback);
  const [activeCollectionId, setActiveCollectionId] = useState<string>(fallback[0]?.id || '');

  useEffect(() => {
    let isMounted = true;
    async function loadDbNavigation() {
      try {
        const dbNav = await getStorefrontNavigationAction(category);
        if (isMounted && dbNav && dbNav.length > 0) {
          setCollections(dbNav as MegamenuCollection[]);
          setActiveCollectionId(dbNav[0].id);
        }
      } catch (err) {
        console.warn('Failed to load navigation from DB, using fallback:', err);
      }
    }
    loadDbNavigation();
    return () => {
      isMounted = false;
    };
  }, [category]);

  const activeCollection =
    collections.find((c) => c.id === activeCollectionId) || collections[0];

  const col1Items = activeCollection?.subitems?.filter((s) => s.columnNumber === 1) || [];
  const col2Items = activeCollection?.subitems?.filter((s) => s.columnNumber === 2) || [];
  const hasSplitColumns = col1Items.length > 0 && col2Items.length > 0;

  // Visual appearance tokens
  const bgColor = config.megaMenuBgColor || '#ffffff';
  const textColor = config.megaMenuTextColor || '#0f172a';
  const mutedColor = config.megaMenuMutedColor || '#94a3b8';
  const borderColor = config.megaMenuBorderColor || '#e2e8f0';
  const tabStyle = config.megaMenuActiveTabStyle || 'border-left';
  const activeTabColor = config.megaMenuActiveTabColor || '#020617';

  // Height & Spacing Controls
  const minHeight = config.megaMenuMinHeightPx || 460;
  const paddingYClass = PADDING_Y_MAP[config.megaMenuPaddingY || 'standard'] || 'py-8';
  const categoryGapClass = CATEGORY_GAP_MAP[config.categoryRowSpacing || 'standard'] || 'space-y-3.5';
  const subitemGapClass = SUBITEM_GAP_MAP[config.subitemRowSpacing || 'standard'] || 'space-y-3';
  const promoCardHeight = config.promoCardHeightPx || 390;

  // Promo Banner Dynamic Category Resolution
  const showPromo = config.showPromoBanner !== false;
  const useCatImage = config.useCategoryImagesInMegaMenu !== false;
  const currentCategoryPromo = activeCollection?.featured;

  const promoTitle =
    useCatImage && currentCategoryPromo?.title
      ? currentCategoryPromo.title
      : config.promoBannerTitle || currentCategoryPromo?.title || 'STREETWEAR';

  const promoEyebrow = config.promoBannerEyebrow || 'DISCOVER';

  const promoImage =
    useCatImage && currentCategoryPromo?.imageUrl
      ? currentCategoryPromo.imageUrl
      : config.promoBannerImageUrl ||
        currentCategoryPromo?.imageUrl ||
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop';

  const promoCta =
    config.promoBannerActionLabel || currentCategoryPromo?.actionLabel || 'SHOP THE EDIT';

  const promoHref =
    useCatImage && currentCategoryPromo?.href
      ? currentCategoryPromo.href
      : config.promoBannerHref || currentCategoryPromo?.href || '/products';

  const promoOpacity = config.promoBannerOverlayOpacity ?? 0.4;
  const promoRadiusClass = RADIUS_MAP[config.promoBannerBorderRadius || 'xl'] || 'rounded-xl';
  const promoShadowClass = SHADOW_MAP[config.promoBannerShadow || 'xl'] || 'shadow-xl';
  const objectFitClass = config.promoBannerObjectFit === 'contain' ? 'object-contain' : 'object-cover';
  const objectPosClass = POSITION_MAP[config.promoBannerPosition || 'center'] || 'object-center';

  // Gradient style computation
  let gradientBackground = `linear-gradient(to top, rgba(0,0,0,${Math.min(
    1,
    promoOpacity + 0.55
  )}) 0%, rgba(0,0,0,${promoOpacity}) 45%, transparent 100%)`;

  if (config.promoBannerGradientStyle === 'dark-full') {
    gradientBackground = `rgba(0,0,0,${Math.min(0.9, promoOpacity + 0.35)})`;
  } else if (config.promoBannerGradientStyle === 'subtle-bottom') {
    gradientBackground = `linear-gradient(to top, rgba(0,0,0,${promoOpacity}) 0%, transparent 60%)`;
  } else if (config.promoBannerGradientStyle === 'radial') {
    gradientBackground = `radial-gradient(circle at center, transparent 20%, rgba(0,0,0,${Math.min(
      1,
      promoOpacity + 0.5
    )}) 100%)`;
  } else if (config.promoBannerGradientStyle === 'none') {
    gradientBackground = 'transparent';
  }

  // 9-Point Content alignment (Figma & Word style)
  const alignmentClass = getNineAlignmentClasses(config.promoBannerAlignment || 'bottom-left').all;

  // Category Hover Effect Class
  const getCategoryHoverClasses = (isActive: boolean) => {
    if (isActive) return '';
    switch (config.categoryHoverEffect) {
      case 'slide-right':
        return 'hover:translate-x-1.5 transition-transform';
      case 'border-reveal':
        return 'hover:border-l-2 hover:pl-2 transition-all';
      case 'pill':
        return 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:px-2 rounded-lg transition-all';
      case 'color-shift':
      default:
        return 'hover:opacity-100 transition-colors';
    }
  };

  // Subitem Hover Effect Class
  const getSubitemHoverClasses = () => {
    switch (config.subitemHoverEffect) {
      case 'arrow':
        return 'group/sub flex items-center justify-between hover:translate-x-1 transition-transform';
      case 'pill':
        return 'hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-colors block';
      case 'bold':
        return 'hover:font-extrabold transition-all block';
      case 'color-shift':
        return 'hover:opacity-100 transition-colors block';
      case 'underline':
      default:
        return 'hover:underline transition-all block';
    }
  };

  return (
    <div
      className="w-full shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div
        style={{ minHeight: `${minHeight}px` }}
        className={`max-w-[1600px] mx-auto px-8 lg:px-14 ${paddingYClass} grid grid-cols-12 gap-8`}
      >
        {/* Left Column: Vertical Category List */}
        <div
          className={`col-span-3 flex flex-col ${categoryGapClass} pr-6`}
          style={{ borderRight: `1px solid ${borderColor}` }}
        >
          {collections.map((col) => {
            const isActive = col.id === activeCollection?.id;
            const hoverClass = getCategoryHoverClasses(isActive);

            if (tabStyle === 'pill') {
              return (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={col.id}
                  onMouseEnter={() => setActiveCollectionId(col.id)}
                  onClick={() => setActiveCollectionId(col.id)}
                  style={{
                    backgroundColor: isActive ? activeTabColor : 'transparent',
                    color: isActive ? '#ffffff' : mutedColor,
                  }}
                  className={`text-left text-sm lg:text-base tracking-tight cursor-pointer px-3.5 py-2 rounded-lg font-bold uppercase ${hoverClass}`}
                >
                  {col.name}
                </button>
              );
            }

            if (tabStyle === 'underline') {
              return (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={col.id}
                  onMouseEnter={() => setActiveCollectionId(col.id)}
                  onClick={() => setActiveCollectionId(col.id)}
                  style={{
                    color: isActive ? activeTabColor : mutedColor,
                    borderBottom: isActive ? `2px solid ${activeTabColor}` : '2px solid transparent',
                  }}
                  className={`text-left text-lg lg:text-xl tracking-tight cursor-pointer pb-1 uppercase inline-block self-start font-bold ${hoverClass}`}
                >
                  {col.name}
                </button>
              );
            }

            if (tabStyle === 'bold-only') {
              return (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={col.id}
                  onMouseEnter={() => setActiveCollectionId(col.id)}
                  onClick={() => setActiveCollectionId(col.id)}
                  style={{
                    color: isActive ? activeTabColor : mutedColor,
                  }}
                  className={`text-left text-lg lg:text-xl tracking-tight cursor-pointer uppercase ${
                    isActive ? 'font-black' : 'font-semibold'
                  } ${hoverClass}`}
                >
                  {col.name}
                </button>
              );
            }

            // Default 'border-left'
            return (
              <button
                type="button"
                suppressHydrationWarning
                key={col.id}
                onMouseEnter={() => setActiveCollectionId(col.id)}
                onClick={() => setActiveCollectionId(col.id)}
                style={{
                  color: isActive ? activeTabColor : mutedColor,
                  borderLeft: isActive ? `2px solid ${activeTabColor}` : '2px solid transparent',
                  paddingLeft: isActive ? '0.75rem' : '0rem',
                }}
                className={`text-left text-lg lg:text-xl tracking-tight cursor-pointer ${
                  isActive ? 'font-black uppercase' : 'font-semibold uppercase'
                } ${hoverClass}`}
              >
                {col.name}
              </button>
            );
          })}
        </div>

        {/* Middle Column: Subitem Grid (expands to 9 cols if promo banner hidden) */}
        <div className={`${showPromo ? 'col-span-5' : 'col-span-9'} px-6`}>
          <p
            className="text-[11px] font-extrabold tracking-[0.25em] uppercase mb-5"
            style={{ color: mutedColor }}
          >
            {activeCollection?.name}
          </p>

          {hasSplitColumns ? (
            <div className={`grid ${showPromo ? 'grid-cols-2' : 'grid-cols-3'} gap-x-8 gap-y-3.5`}>
              <div className={`flex flex-col ${subitemGapClass}`}>
                {col1Items.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    onClick={onClose}
                    style={{ color: textColor }}
                    className={`text-xs font-semibold ${getSubitemHoverClasses()} line-clamp-1`}
                  >
                    <span>{sub.label}</span>
                    {config.subitemHoverEffect === 'arrow' && (
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
              <div className={`flex flex-col ${subitemGapClass}`}>
                {col2Items.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    onClick={onClose}
                    style={{ color: textColor }}
                    className={`text-xs font-semibold ${getSubitemHoverClasses()} line-clamp-1`}
                  >
                    <span>{sub.label}</span>
                    {config.subitemHoverEffect === 'arrow' && (
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid ${showPromo ? 'grid-cols-2' : 'grid-cols-3'} gap-x-6 gap-y-3.5`}>
              {(activeCollection?.subitems || []).map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  onClick={onClose}
                  style={{ color: textColor }}
                  className={`text-xs font-semibold ${getSubitemHoverClasses()} line-clamp-1`}
                >
                  <span>{sub.label}</span>
                  {config.subitemHoverEffect === 'arrow' && (
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Featured Editorial Promotional Card */}
        {showPromo && (
          <div className="col-span-4 pl-4">
            <Link
              href={promoHref}
              onClick={onClose}
              style={{
                height: `${promoCardHeight}px`,
                border: `1px solid ${borderColor}`,
              }}
              className={`group relative block w-full ${promoRadiusClass} ${promoShadowClass} overflow-hidden`}
            >
              <Image
                key={promoImage}
                src={promoImage}
                alt={promoTitle}
                fill
                priority
                className={`${objectFitClass} ${objectPosClass} transition-all duration-700 ${
                  config.promoCardHoverZoom !== false ? 'group-hover:scale-105' : ''
                }`}
                sizes="(max-width: 1200px) 35vw, 28vw"
              />
              <div
                className={`absolute inset-0 flex flex-col ${alignmentClass} p-6 text-white transition-opacity duration-300`}
                style={{
                  background: gradientBackground,
                }}
              >
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-300 uppercase mb-1">
                  {promoEyebrow}
                </span>
                <h4 className="text-2xl lg:text-3xl font-black font-heading uppercase tracking-tight text-white mb-2 leading-none">
                  {promoTitle}
                </h4>
                <div className="flex items-center text-xs font-bold text-white group-hover:translate-x-1.5 transition-transform">
                  {promoCta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MegamenuPanel;
