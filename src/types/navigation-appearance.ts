export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  hasMega: boolean;
  highlight?: boolean;
  badgeText?: string;
  badgeColor?: string;
}

export type HeaderHeightOption = 'compact' | 'standard' | 'luxury' | 'custom';
export type HeaderWidthOption = 'boxed' | 'wide' | 'full';
export type LogoFontOption = 'heading' | 'sans' | 'serif' | 'mono';
export type LogoSizeOption = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
export type LogoWeightOption = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
export type LogoSpacingOption = 'normal' | 'wide' | 'widest' | 'ultra-wide';
export type LinksAlignOption = 'left' | 'center' | 'right';
export type LinksSpacingOption = 'compact' | 'normal' | 'wide';
export type LinksFontSizeOption = 'xs' | 'sm' | 'base';
export type LinksFontWeightOption = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type LinksTransformOption = 'uppercase' | 'capitalize' | 'none';
export type MegamenuTabStyleOption = 'border-left' | 'pill' | 'underline' | 'bold-only';
export type IconStyleOption = 'minimal' | 'rounded-button' | 'square-button';
export type PromoBannerRadiusOption = 'none' | 'md' | 'lg' | 'xl' | '2xl';
export type PromoBannerObjectFit = 'cover' | 'contain';
export type PromoBannerPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type PromoBannerGradientStyle = 'dark-bottom' | 'dark-full' | 'subtle-bottom' | 'radial' | 'none';
export type PromoBannerShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type PromoBannerAlignment =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';
export type LinksHoverEffectOption = 'opacity' | 'underline' | 'color-shift' | 'pill' | 'glow';
export type CategoryHoverEffectOption = 'slide-right' | 'color-shift' | 'border-reveal' | 'pill' | 'none';
export type SubitemHoverEffectOption = 'underline' | 'arrow' | 'color-shift' | 'bold' | 'pill';
export type SpacingScaleOption = 'compact' | 'standard' | 'relaxed';

export interface NavAppearanceConfig {
  // 1. Header Bar Layout & Colors & Height Controls
  height: HeaderHeightOption;
  headerHeightPx: number;
  customHeightPx?: number;
  backgroundColor: string;
  translucentBlur: boolean;
  isSticky: boolean;
  borderBottom: boolean;
  borderColor: string;
  textColor: string;
  activeTextColor: string;
  maxWidth: HeaderWidthOption;

  // 2. Logo & Branding
  logoType: 'text' | 'image';
  logoText: string;
  logoFont: LogoFontOption;
  logoFontSize: LogoSizeOption;
  logoFontWeight: LogoWeightOption;
  logoLetterSpacing: LogoSpacingOption;
  logoColor: string;
  logoImageUrl?: string;
  logoImageHeight?: number;

  // 3. Navigation Links & Hover Styles
  linksAlignment: LinksAlignOption;
  linksSpacing: LinksSpacingOption;
  linksFontSize: LinksFontSizeOption;
  linksFontWeight: LinksFontWeightOption;
  linksTextTransform: LinksTransformOption;
  linksLetterSpacing: LogoSpacingOption;
  linksHoverEffect: LinksHoverEffectOption;
  linksHoverColor?: string;
  links: NavLinkItem[];

  // 4. Mega Menu Dropdown Appearance & Height Controls
  megaMenuBgColor: string;
  megaMenuTextColor: string;
  megaMenuMutedColor: string;
  megaMenuBorderColor: string;
  megaMenuActiveTabStyle: MegamenuTabStyleOption;
  megaMenuActiveTabColor: string;
  megaMenuMinHeightPx: number;
  megaMenuPaddingY: SpacingScaleOption;
  categoryRowSpacing: SpacingScaleOption;
  categoryHoverEffect: CategoryHoverEffectOption;
  categoryHoverColor?: string;
  subitemRowSpacing: SpacingScaleOption;
  subitemHoverEffect: SubitemHoverEffectOption;
  subitemHoverColor?: string;

  // 5. Mega Menu Promo Banner & Height
  showPromoBanner: boolean;
  promoBannerTitle: string;
  promoBannerEyebrow: string;
  promoBannerImageUrl: string;
  promoBannerActionLabel: string;
  promoBannerHref: string;
  promoBannerOverlayOpacity: number;
  promoBannerBorderRadius: PromoBannerRadiusOption;
  promoCardHeightPx: number;
  promoCardHoverZoom: boolean;
  promoBannerObjectFit?: PromoBannerObjectFit;
  promoBannerPosition?: PromoBannerPosition;
  promoBannerGradientStyle?: PromoBannerGradientStyle;
  promoBannerShadow?: PromoBannerShadow;
  promoBannerAlignment?: PromoBannerAlignment;
  useCategoryImagesInMegaMenu?: boolean;

  // 6. Action Icons & Utility Elements
  showSearch: boolean;
  showAccount: boolean;
  showWishlist: boolean;
  showCart: boolean;
  cartBadgeBgColor: string;
  cartBadgeTextColor: string;
  iconStyle: IconStyleOption;

  // 7. Top Announcement Bar Companion
  showAnnouncementBar: boolean;
  announcementMessage: string;
  announcementCtaText?: string;
  announcementCtaUrl?: string;
  announcementBgColor: string;
  announcementTextColor: string;
}

export const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 'nav-men', label: 'MEN', href: '/products?category=men', hasMega: true },
  { id: 'nav-women', label: 'WOMEN', href: '/products?category=women', hasMega: true },
  { id: 'nav-collections', label: 'COLLECTIONS', href: '/collections', hasMega: true },
  { id: 'nav-shop-all', label: 'SHOP ALL', href: '/products', hasMega: false },
  { id: 'nav-festive', label: 'FESTIVE & LIMITED', href: '/products?edition=limited', hasMega: false, highlight: true, badgeText: 'LIMITED', badgeColor: '#4f46e5' },
  { id: 'nav-offers', label: 'OFFERS', href: '/products?availability=in-stock', hasMega: false },
];

export const defaultNavAppearanceConfig: NavAppearanceConfig = {
  // 1. Header Bar & Height Controls
  height: 'standard', // 72px / 4.5rem
  headerHeightPx: 72,
  backgroundColor: '#ffffff',
  translucentBlur: true,
  isSticky: true,
  borderBottom: true,
  borderColor: '#e2e8f0',
  textColor: '#0f172a',
  activeTextColor: '#000000',
  maxWidth: 'wide',

  // 2. Logo
  logoType: 'text',
  logoText: 'LEXIDO',
  logoFont: 'heading',
  logoFontSize: '2xl',
  logoFontWeight: 'black',
  logoLetterSpacing: 'ultra-wide',
  logoColor: '#0f172a',
  logoImageUrl: '',
  logoImageHeight: 32,

  // 3. Links & Hover Styles
  linksAlignment: 'center',
  linksSpacing: 'normal',
  linksFontSize: 'xs',
  linksFontWeight: 'bold',
  linksTextTransform: 'uppercase',
  linksLetterSpacing: 'widest',
  linksHoverEffect: 'underline',
  linksHoverColor: '#000000',
  links: DEFAULT_NAV_LINKS,

  // 4. Mega Menu Dropdown & Height Controls
  megaMenuBgColor: '#ffffff',
  megaMenuTextColor: '#0f172a',
  megaMenuMutedColor: '#94a3b8',
  megaMenuBorderColor: '#e2e8f0',
  megaMenuActiveTabStyle: 'border-left',
  megaMenuActiveTabColor: '#020617',
  megaMenuMinHeightPx: 460,
  megaMenuPaddingY: 'standard',
  categoryRowSpacing: 'standard',
  categoryHoverEffect: 'slide-right',
  categoryHoverColor: '#0f172a',
  subitemRowSpacing: 'standard',
  subitemHoverEffect: 'underline',
  subitemHoverColor: '#000000',

  // 5. Promo Banner & Height
  showPromoBanner: true,
  promoBannerTitle: 'STREETWEAR',
  promoBannerEyebrow: 'DISCOVER',
  promoBannerImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
  promoBannerActionLabel: 'SHOP THE EDIT',
  promoBannerHref: '/products?category=streetwear',
  promoBannerOverlayOpacity: 0.4,
  promoBannerBorderRadius: 'xl',
  promoCardHeightPx: 390,
  promoCardHoverZoom: true,
  promoBannerObjectFit: 'cover',
  promoBannerPosition: 'center',
  promoBannerGradientStyle: 'dark-bottom',
  promoBannerShadow: 'xl',
  promoBannerAlignment: 'bottom-left',
  useCategoryImagesInMegaMenu: true,

  // 6. Action Icons
  showSearch: true,
  showAccount: true,
  showWishlist: true,
  showCart: true,
  cartBadgeBgColor: '#0f172a',
  cartBadgeTextColor: '#ffffff',
  iconStyle: 'rounded-button',

  // 7. Announcement Bar
  showAnnouncementBar: false,
  announcementMessage: 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER $100',
  announcementCtaText: 'SHOP NOW',
  announcementCtaUrl: '/products',
  announcementBgColor: '#000000',
  announcementTextColor: '#ffffff',
};

export interface NavAppearancePreset {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  config: Partial<NavAppearanceConfig>;
}

export const NAV_APPEARANCE_PRESETS: NavAppearancePreset[] = [
  {
    id: 'lexido-luxury',
    name: 'Lexido Luxury (Default)',
    description: 'Crisp white, wide letter tracking, rounded action buttons, signature black category borders.',
    previewBg: '#ffffff',
    previewAccent: '#0f172a',
    config: {
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      activeTextColor: '#000000',
      logoFont: 'heading',
      logoLetterSpacing: 'ultra-wide',
      megaMenuBgColor: '#ffffff',
      megaMenuTextColor: '#0f172a',
      megaMenuActiveTabStyle: 'border-left',
      megaMenuActiveTabColor: '#020617',
      iconStyle: 'rounded-button',
      cartBadgeBgColor: '#0f172a',
      cartBadgeTextColor: '#ffffff',
    },
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Noir (Dark Mode)',
    description: 'Sleek dark obsidian backdrop, warm amber accents, high contrast typography, dark glass dropdown.',
    previewBg: '#09090b',
    previewAccent: '#f59e0b',
    config: {
      backgroundColor: '#09090b',
      textColor: '#f4f4f5',
      borderColor: '#27272a',
      activeTextColor: '#f59e0b',
      logoColor: '#ffffff',
      megaMenuBgColor: '#09090b',
      megaMenuTextColor: '#f4f4f5',
      megaMenuMutedColor: '#71717a',
      megaMenuBorderColor: '#27272a',
      megaMenuActiveTabStyle: 'border-left',
      megaMenuActiveTabColor: '#f59e0b',
      iconStyle: 'rounded-button',
      cartBadgeBgColor: '#f59e0b',
      cartBadgeTextColor: '#000000',
    },
  },
  {
    id: 'glass-minimal',
    name: 'Translucent Glass Blur',
    description: 'Frosted glass translucent header, delicate border lines, minimalist borderless action buttons.',
    previewBg: '#f8fafc',
    previewAccent: '#4f46e5',
    config: {
      backgroundColor: 'rgba(255, 255, 255, 0.82)',
      translucentBlur: true,
      textColor: '#1e293b',
      borderColor: 'rgba(226, 232, 240, 0.7)',
      activeTextColor: '#4f46e5',
      megaMenuBgColor: '#ffffff',
      megaMenuActiveTabStyle: 'pill',
      megaMenuActiveTabColor: '#4f46e5',
      iconStyle: 'minimal',
      cartBadgeBgColor: '#4f46e5',
      cartBadgeTextColor: '#ffffff',
    },
  },
  {
    id: 'warm-editorial',
    name: 'Editorial Atelier',
    description: 'Warm cream canvas, espresso typography, serif branding, terracotta highlights, underline category tabs.',
    previewBg: '#fbf9f5',
    previewAccent: '#c2410c',
    config: {
      backgroundColor: '#fbf9f5',
      textColor: '#292524',
      borderColor: '#e7e5e4',
      activeTextColor: '#c2410c',
      logoFont: 'serif',
      logoColor: '#1c1917',
      megaMenuBgColor: '#fbf9f5',
      megaMenuTextColor: '#292524',
      megaMenuMutedColor: '#a8a29e',
      megaMenuBorderColor: '#e7e5e4',
      megaMenuActiveTabStyle: 'underline',
      megaMenuActiveTabColor: '#c2410c',
      iconStyle: 'rounded-button',
      cartBadgeBgColor: '#c2410c',
      cartBadgeTextColor: '#ffffff',
    },
  },
  {
    id: 'streetwear-bold',
    name: 'Streetwear Electric',
    description: 'Pitch black, electric neon accents, square button icons, bold compact navigation.',
    previewBg: '#000000',
    previewAccent: '#ccff00',
    config: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderColor: '#262626',
      activeTextColor: '#ccff00',
      logoColor: '#ffffff',
      megaMenuBgColor: '#0a0a0a',
      megaMenuTextColor: '#ffffff',
      megaMenuMutedColor: '#737373',
      megaMenuBorderColor: '#262626',
      megaMenuActiveTabStyle: 'pill',
      megaMenuActiveTabColor: '#ccff00',
      iconStyle: 'square-button',
      cartBadgeBgColor: '#ccff00',
      cartBadgeTextColor: '#000000',
    },
  },
  {
    id: 'pure-minimalist',
    name: 'Pure Minimalist (Clean)',
    description: 'Compact 56px height, no bottom borders, subtle typography, clean focus on photography.',
    previewBg: '#ffffff',
    previewAccent: '#64748b',
    config: {
      height: 'compact',
      backgroundColor: '#ffffff',
      borderBottom: false,
      textColor: '#334155',
      activeTextColor: '#020617',
      megaMenuBgColor: '#ffffff',
      megaMenuActiveTabStyle: 'bold-only',
      iconStyle: 'minimal',
      cartBadgeBgColor: '#0f172a',
      cartBadgeTextColor: '#ffffff',
    },
  },
];

