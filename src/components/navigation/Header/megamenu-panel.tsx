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
  WOMEN: [
    {
      id: 'streetwear',
      name: 'STREETWEAR',
      href: '/women/streetwear',
      subitems: [
        { label: 'Oversized T-Shirts', href: '/women/streetwear', columnNumber: 1 },
        { label: 'Cropped Tees', href: '/women/streetwear', columnNumber: 2 },
        { label: 'Baggy Jeans', href: '/women/streetwear', columnNumber: 1 },
        { label: 'Cargo Pants', href: '/women/streetwear', columnNumber: 2 },
        { label: 'Oversized Hoodies', href: '/women/streetwear', columnNumber: 1 },
        { label: 'Sweatshirts', href: '/women/streetwear', columnNumber: 2 },
        { label: 'Bomber Jackets', href: '/women/streetwear', columnNumber: 1 },
        { label: 'Denim Jackets', href: '/women/streetwear', columnNumber: 2 },
        { label: 'Shorts', href: '/women/streetwear', columnNumber: 1 },
      ],
      featured: {
        title: 'STREETWEAR',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
        href: '/women/streetwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'gymwear',
      name: 'GYM WEAR',
      href: '/women/gymwear',
      subitems: [
        { label: 'Biker Shorts', href: '/women/gymwear', columnNumber: 1 },
        { label: 'Pilates Sets', href: '/women/gymwear', columnNumber: 2 },
        { label: 'Running Jackets', href: '/women/gymwear', columnNumber: 1 },
        { label: 'Seamless Leggings', href: '/women/gymwear', columnNumber: 2 },
        { label: 'Sports Bras', href: '/women/gymwear', columnNumber: 1 },
        { label: 'Training Tanks', href: '/women/gymwear', columnNumber: 2 },
      ],
      featured: {
        title: 'GYM WEAR',
        imageUrl: 'https://pub-ae8fd88d076743ec82d6335a981e38e3.r2.dev/categories/activewear.jpg',
        href: '/women/gymwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'old-money',
      name: 'OLD MONEY',
      href: '/women/luxury',
      subitems: [
        { label: 'Cashmere Sweaters', href: '/women/luxury', columnNumber: 1 },
        { label: 'Tailored Blazers', href: '/women/luxury', columnNumber: 2 },
        { label: 'Silk Slip Dresses', href: '/women/luxury', columnNumber: 1 },
        { label: 'Linen Shirts', href: '/women/luxury', columnNumber: 2 },
        { label: 'Pleated Trousers', href: '/women/luxury', columnNumber: 1 },
        { label: 'Tweed Jackets', href: '/women/luxury', columnNumber: 2 },
      ],
      featured: {
        title: 'OLD MONEY LUXURY',
        imageUrl: 'https://pub-ae8fd88d076743ec82d6335a981e38e3.r2.dev/categories/luxury.jpg',
        href: '/women/luxury',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'casual',
      name: 'CASUAL',
      href: '/women/casual',
      subitems: [
        { label: 'Everyday Tees', href: '/women/casual', columnNumber: 1 },
        { label: 'Cotton Sweats', href: '/women/casual', columnNumber: 2 },
        { label: 'Relaxed Denim', href: '/women/casual', columnNumber: 1 },
        { label: 'Canvas Jackets', href: '/women/casual', columnNumber: 2 },
        { label: 'Knit Cardigans', href: '/women/casual', columnNumber: 1 },
        { label: 'Lounge Sets', href: '/women/casual', columnNumber: 2 },
      ],
      featured: {
        title: 'CASUAL ESSENTIALS',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        href: '/women/casual',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'formal',
      name: 'FORMAL',
      href: '/women/formal',
      subitems: [
        { label: 'Evening Gowns', href: '/women/formal', columnNumber: 1 },
        { label: 'Silk Blouses', href: '/women/formal', columnNumber: 2 },
        { label: 'Cocktail Dresses', href: '/women/formal', columnNumber: 1 },
        { label: 'Pencil Skirts', href: '/women/formal', columnNumber: 2 },
        { label: 'Tuxedo Suits', href: '/women/formal', columnNumber: 1 },
        { label: 'Structured Coats', href: '/women/formal', columnNumber: 2 },
      ],
      featured: {
        title: 'FORMAL EDIT',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
        href: '/women/formal',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'winter',
      name: 'WINTER COLLECTION',
      href: '/women/winter',
      subitems: [
        { label: 'Down Parkas', href: '/women/winter', columnNumber: 1 },
        { label: 'Thermal Knitwear', href: '/women/winter', columnNumber: 2 },
        { label: 'Wool Trench Coats', href: '/women/winter', columnNumber: 1 },
        { label: 'Cashmere Scarves', href: '/women/winter', columnNumber: 2 },
        { label: 'Shearling Jackets', href: '/women/winter', columnNumber: 1 },
        { label: 'Winter Boots', href: '/women/winter', columnNumber: 2 },
      ],
      featured: {
        title: 'WINTER COLLECTION',
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1200&auto=format&fit=crop',
        href: '/women/winter',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'accessories',
      name: "WOMEN'S ACCESSORIES",
      href: '/women/accessories',
      subitems: [
        { label: 'Leather Handbags', href: '/women/accessories', columnNumber: 1 },
        { label: 'Silk Bandanas', href: '/women/accessories', columnNumber: 2 },
        { label: 'Designer Sunglasses', href: '/women/accessories', columnNumber: 1 },
        { label: 'Leather Belts', href: '/women/accessories', columnNumber: 2 },
        { label: 'Minimalist Jewelry', href: '/women/accessories', columnNumber: 1 },
        { label: 'Atelier Perfume', href: '/women/accessories', columnNumber: 2 },
      ],
      featured: {
        title: "WOMEN'S ACCESSORIES",
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
        href: '/women/accessories',
        actionLabel: 'SHOP THE EDIT',
      },
    },
  ],
  MEN: [
    {
      id: 'streetwear',
      name: 'STREETWEAR',
      href: '/men/streetwear',
      subitems: [
        { label: 'Oversized T-Shirts', href: '/men/streetwear/oversized-t-shirts', columnNumber: 1 },
        { label: 'Cargo Pants', href: '/men/streetwear/cargo-pants', columnNumber: 2 },
        { label: 'Baggy Jeans', href: '/men/streetwear/baggy-jeans', columnNumber: 1 },
        { label: 'Graphic Hoodies', href: '/men/streetwear/graphic-hoodies', columnNumber: 2 },
        { label: 'Bomber Jackets', href: '/men/streetwear/bomber-jackets', columnNumber: 1 },
        { label: 'Fleece Sweats', href: '/men/streetwear', columnNumber: 2 },
      ],
      featured: {
        title: 'STREETWEAR',
        imageUrl: 'https://pub-ae8fd88d076743ec82d6335a981e38e3.r2.dev/categories/streetwear.jpg',
        href: '/men/streetwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'gymwear',
      name: 'GYM WEAR',
      href: '/men/gymwear',
      subitems: [
        { label: 'Athletic Shorts', href: '/men/gymwear/athletic-shorts', columnNumber: 1 },
        { label: 'Compression Tops', href: '/men/gymwear/compression-tops', columnNumber: 2 },
        { label: 'Dry Fit Tees', href: '/men/gymwear/dry-fit-tees', columnNumber: 1 },
        { label: 'Signature Gym Set', href: '/men/gymwear/signature-gym-set', columnNumber: 2 },
        { label: 'Training Joggers', href: '/men/gymwear/training-joggers', columnNumber: 1 },
      ],
      featured: {
        title: 'GYM WEAR',
        imageUrl: 'https://pub-ae8fd88d076743ec82d6335a981e38e3.r2.dev/categories/gymwear.jpg',
        href: '/men/gymwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'luxury',
      name: 'OLD MONEY',
      href: '/men/luxury',
      subitems: [
        { label: 'Cashmere Sweaters', href: '/men/luxury/cashmere-sweaters', columnNumber: 1 },
        { label: 'Linen Shirts', href: '/men/luxury/linen-shirts', columnNumber: 2 },
        { label: 'Merino Knit Polos', href: '/men/luxury/merino-knit-polos', columnNumber: 1 },
        { label: 'Overcoats', href: '/men/luxury/overcoats', columnNumber: 2 },
        { label: 'Tailored Trousers', href: '/men/luxury/tailored-trousers', columnNumber: 1 },
      ],
      featured: {
        title: 'OLD MONEY LUXURY',
        imageUrl: 'https://pub-ae8fd88d076743ec82d6335a981e38e3.r2.dev/categories/luxury.jpg',
        href: '/men/luxury',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'casual',
      name: 'CASUAL',
      href: '/men/casual',
      subitems: [
        { label: 'Heavyweight Tees', href: '/men/casual', columnNumber: 1 },
        { label: 'Classic Chinos', href: '/men/casual', columnNumber: 2 },
        { label: 'Flannel Overshirts', href: '/men/casual', columnNumber: 1 },
        { label: 'Denim Jackets', href: '/men/casual', columnNumber: 2 },
        { label: 'Everyday Polos', href: '/men/casual', columnNumber: 1 },
      ],
      featured: {
        title: 'CASUAL ESSENTIALS',
        imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200&auto=format&fit=crop',
        href: '/men/casual',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'formal',
      name: 'FORMAL',
      href: '/men/formal',
      subitems: [
        { label: 'Double-Breasted Suits', href: '/men/formal', columnNumber: 1 },
        { label: 'French Cuff Shirts', href: '/men/formal', columnNumber: 2 },
        { label: 'Silk Neckties', href: '/men/formal', columnNumber: 1 },
        { label: 'Wool Blazers', href: '/men/formal', columnNumber: 2 },
        { label: 'Handcrafted Oxfords', href: '/men/formal', columnNumber: 1 },
      ],
      featured: {
        title: 'FORMAL ATELIER',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
        href: '/men/formal',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'winter',
      name: 'WINTER COLLECTION',
      href: '/men/winter',
      subitems: [
        { label: 'Puffer Jackets', href: '/men/winter', columnNumber: 1 },
        { label: 'Wool Overcoats', href: '/men/winter', columnNumber: 2 },
        { label: 'Thermal Layers', href: '/men/winter', columnNumber: 1 },
        { label: 'Shearling Coats', href: '/men/winter', columnNumber: 2 },
        { label: 'Cashmere Beanies', href: '/men/winter', columnNumber: 1 },
      ],
      featured: {
        title: 'WINTER COLLECTION',
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1200&auto=format&fit=crop',
        href: '/men/winter',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'accessories',
      name: "MEN'S ACCESSORIES",
      href: '/men/accessories',
      subitems: [
        { label: 'Leather Wallets', href: '/men/accessories', columnNumber: 1 },
        { label: 'Automatic Watches', href: '/men/accessories', columnNumber: 2 },
        { label: 'Italian Leather Belts', href: '/men/accessories', columnNumber: 1 },
        { label: 'Aviator Sunglasses', href: '/men/accessories', columnNumber: 2 },
        { label: 'Weekend Duffle Bags', href: '/men/accessories', columnNumber: 1 },
      ],
      featured: {
        title: "MEN'S ACCESSORIES",
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
        href: '/men/accessories',
        actionLabel: 'SHOP THE EDIT',
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
  compact: 'space-y-3',
  standard: 'space-y-4 sm:space-y-5 lg:space-y-6',
  relaxed: 'space-y-6 sm:space-y-7',
};

const SUBITEM_GAP_MAP: Record<string, string> = {
  compact: 'space-y-2.5',
  standard: 'space-y-3.5 sm:space-y-4',
  relaxed: 'space-y-4.5 sm:space-y-5',
};

interface MegamenuPanelProps {
  category: string;
  onClose: () => void;
  appearance?: NavAppearanceConfig;
  headerHeight?: number;
}

export function MegamenuPanel({ category, onClose, appearance, headerHeight }: MegamenuPanelProps) {
  const { navConfig: liveConfig } = useNavAppearance(appearance);
  const config = appearance || liveConfig;

  const fallback = FALLBACK_MEGAMENU_DATA[category.toUpperCase()] || FALLBACK_MEGAMENU_DATA.MEN;
  const [collections, setCollections] = useState<MegamenuCollection[]>(fallback);
  const [activeCollectionId, setActiveCollectionId] = useState<string>(fallback[0]?.id || '');

  useEffect(() => {
    let isMounted = true;
    const currentFallback = FALLBACK_MEGAMENU_DATA[category.toUpperCase()] || FALLBACK_MEGAMENU_DATA.MEN;
    setCollections(currentFallback);
    setActiveCollectionId(currentFallback[0]?.id || '');

    async function loadDbNavigation() {
      try {
        const dbNav = await getStorefrontNavigationAction(category);
        if (isMounted && dbNav && dbNav.length > 0) {
          // Keep all DB categories and augment with remaining fallback categories from reference
          const existingNames = new Set(dbNav.map((c) => c.name.toUpperCase().trim()));
          const extraFallback = currentFallback.filter((f) => !existingNames.has(f.name.toUpperCase().trim()));
          const combined = [...dbNav, ...extraFallback];
          setCollections(combined as MegamenuCollection[]);
          setActiveCollectionId((prev) => {
            const exists = combined.some((c) => c.id === prev);
            return exists ? prev : combined[0].id;
          });
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
  const isFullViewport = config.megaMenuFullViewport !== false;
  const effectiveHeaderHeight = headerHeight || (config.headerHeightPx || 72);
  const minHeight = config.megaMenuMinHeightPx || 460;
  const paddingYClass = PADDING_Y_MAP[config.megaMenuPaddingY || 'standard'] || 'py-8';
  const categoryGapClass = CATEGORY_GAP_MAP[config.categoryRowSpacing || 'standard'] || 'space-y-4';
  const subitemGapClass = SUBITEM_GAP_MAP[config.subitemRowSpacing || 'standard'] || 'space-y-3.5';
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
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';

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
      className="w-full shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: `1px solid ${borderColor}`,
        ...(isFullViewport
          ? {
              height: `calc(100vh - ${effectiveHeaderHeight}px)`,
              maxHeight: `calc(100vh - ${effectiveHeaderHeight}px)`,
            }
          : { minHeight: `${minHeight}px` }),
      }}
    >
      <div className="w-full flex-1 flex flex-row min-h-0 h-full overflow-hidden">
        {/* Left & Middle Column Container */}
        <div className="flex-1 min-w-0 flex flex-row h-full overflow-y-auto no-scrollbar py-8 sm:py-10 lg:py-12 pl-8 sm:pl-12 lg:pl-16 pr-6 sm:pr-8">
          {/* Left Column: Vertical Category List */}
          <div
            className={`w-[240px] sm:w-[280px] lg:w-[320px] shrink-0 flex flex-col ${categoryGapClass} pr-6 h-full overflow-y-auto no-scrollbar`}
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
                    className={`text-left text-lg sm:text-xl tracking-tight cursor-pointer px-4 py-2 rounded-xl uppercase transition-all ${
                      isActive ? 'font-bold' : 'font-medium hover:text-slate-900 dark:hover:text-white'
                    } ${hoverClass}`}
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
                    className={`text-left text-fluid-nav text-[22px] sm:text-[26px] lg:text-[30px] font-nav-title tracking-tight cursor-pointer pb-1 uppercase inline-block self-start transition-colors ${
                      isActive
                        ? 'font-medium text-slate-950 dark:text-white'
                        : 'font-light text-neutral-400 dark:text-neutral-500 hover:text-slate-950 dark:hover:text-white'
                    } ${hoverClass}`}
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
                    className={`text-left text-fluid-nav text-[22px] sm:text-[26px] lg:text-[30px] font-nav-title tracking-tight cursor-pointer uppercase transition-colors ${
                      isActive
                        ? 'font-medium text-slate-950 dark:text-white'
                        : 'font-light text-neutral-400 dark:text-neutral-500 hover:text-slate-950 dark:hover:text-white'
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
                    paddingLeft: '0.75rem',
                    marginLeft: '-0.75rem',
                  }}
                  className={`text-left text-fluid-nav text-[22px] sm:text-[26px] lg:text-[30px] font-nav-title tracking-tight cursor-pointer transition-colors ${
                    isActive
                      ? 'font-medium uppercase text-slate-950 dark:text-white'
                      : 'font-light uppercase text-neutral-400 dark:text-neutral-500 hover:text-slate-950 dark:hover:text-white'
                  } ${hoverClass}`}
                >
                  {col.name}
                </button>
              );
            })}
          </div>

          {/* Middle Column: Subitem Grid */}
          <div className="flex-1 min-w-0 pl-10 sm:pl-16 lg:pl-20 pr-6 flex flex-col h-full overflow-y-auto no-scrollbar">
            <p
              className="text-[10px] sm:text-[11px] font-normal tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mb-7 sm:mb-8 shrink-0"
            >
              {activeCollection?.name}
            </p>

            {hasSplitColumns ? (
              <div className="grid grid-cols-2 gap-x-12 sm:gap-x-16 lg:gap-x-20">
                <div className={`flex flex-col ${subitemGapClass}`}>
                  {col1Items.map((sub, idx) => (
                    <Link
                      key={idx}
                      href={sub.href}
                      onClick={onClose}
                      style={{ color: textColor }}
                      className={`text-[13px] sm:text-[14px] font-normal text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-150 py-0.5 ${getSubitemHoverClasses()} line-clamp-1`}
                    >
                      <span>{sub.label}</span>
                      {config.subitemHoverEffect === 'arrow' && (
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
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
                      className={`text-[13px] sm:text-[14px] font-normal text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-150 py-0.5 ${getSubitemHoverClasses()} line-clamp-1`}
                    >
                      <span>{sub.label}</span>
                      {config.subitemHoverEffect === 'arrow' && (
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-12 sm:gap-x-16 lg:gap-x-20 gap-y-4 sm:gap-y-4.5">
                {(activeCollection?.subitems || []).map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    onClick={onClose}
                    style={{ color: textColor }}
                    className={`text-[13px] sm:text-[14px] font-normal text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-150 py-0.5 ${getSubitemHoverClasses()} line-clamp-1`}
                  >
                    <span>{sub.label}</span>
                    {config.subitemHoverEffect === 'arrow' && (
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Featured Editorial Promotional Card */}
        {showPromo && (
          <div className="w-[36%] sm:w-[38%] lg:w-[40%] xl:w-[42%] shrink-0 h-full relative overflow-hidden flex flex-col">
            <Link
              href={promoHref}
              onClick={onClose}
              className="group relative h-full w-full block overflow-hidden"
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
                sizes="(max-width: 1200px) 45vw, 40vw"
              />
              <div
                className={`absolute inset-0 flex flex-col ${alignmentClass} p-8 sm:p-10 lg:p-12 text-white transition-opacity duration-300`}
                style={{
                  background: gradientBackground,
                }}
              >
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-white/90 uppercase mb-1.5">
                  {promoEyebrow}
                </span>
                <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black font-clash uppercase tracking-tight text-white mb-3 leading-none">
                  {promoTitle}
                </h4>
                <div className="flex items-center text-[11px] sm:text-xs font-bold text-white uppercase tracking-[0.2em] group-hover:translate-x-1.5 transition-transform">
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
