export type SectionType =
  // Category A: Headers & Navigation
  | 'ANNOUNCEMENT_BAR'
  | 'TOP_UTILITY_BAR'
  | 'STORE_HEADER'
  | 'PROMO_STICKY_HEADER'
  | 'MEGA_MENU_HEADER'
  // Category B: Heroes & Banners
  | 'HERO'
  | 'SPLIT_HERO'
  | 'VIDEO_HERO'
  | 'COUNTDOWN_HERO'
  | 'MINIMAL_HERO'
  | 'BACKGROUND_SLIDER_HERO'
  // Category C: Product Showcases & Grids
  | 'PRODUCT_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'FEATURED_PRODUCT_SPOTLIGHT'
  | 'FLASH_SALE_GRID'
  | 'BESTSELLERS_SHOWCASE'
  | 'OFFERS_BUNDLE_GRID'
  | 'FESTIVE_BUNDLE_GRID'
  | 'LIMITED_EDITION_GRID'
  | 'PRODUCT_SPECIFICATION_SHEET'
  | 'BUNDLE_SAVE_SHOWCASE'
  | 'STICKY_ADD_TO_CART_BAR'
  // Category D: Category & Collection Discovery
  | 'CATEGORY_GRID'
  | 'CATEGORY_CIRCLES'
  | 'SHOPPABLE_LOOKBOOK'
  | 'COLLECTION_SHOWCASE'
  | 'MASONRY_GALLERY'
  | 'BRAND_LOGOS_SLIDER'
  // Category E: Promotions & Conversion
  | 'PROMO_BANNER'
  | 'MARQUEE_TICKER'
  | 'FREE_SHIPPING_PROGRESS'
  | 'EXIT_INTENT_POPUP'
  | 'VIP_REWARDS_CARD'
  | 'COUPON_WHEEL'
  | 'LIMITED_DEAL_BANNER'
  // Category F: Content, Trust & Social Proof
  | 'TESTIMONIALS'
  | 'FEATURE_HIGHLIGHTS'
  | 'FAQ_ACCORDION'
  | 'INSTAGRAM_FEED'
  | 'BRAND_STORY'
  | 'EDITORIAL_BANNER'
  | 'PRESS_MENTIONS'
  // Category G: Utility & Footers
  | 'NEWSLETTER'
  | 'BEFORE_AFTER_SLIDER'
  | 'STORE_LOCATOR'
  | 'MULTI_COLUMN_FOOTER'
  | 'MINIMAL_FOOTER'
  | 'REVIEWS_OVERVIEW_GRID'
  | 'SIZE_GUIDE_MODAL_SECTION'
  | 'CUSTOM_HTML_CANVAS'
  // Legacy / Aliases
  | 'IMAGE_TEXT_SPLIT'
  | 'FEATURED_PRODUCTS'
  | 'EDITORIAL_GRID'
  | 'SEASONAL_SALE_GRID'
  | 'FAQ'
  | 'CUSTOM_CONTENT';

export type SectionCategory =
  | 'headers'
  | 'heroes'
  | 'products'
  | 'categories'
  | 'promotions'
  | 'trust'
  | 'utility';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'color'
  | 'boolean'
  | 'image'
  | 'url'
  | 'product-source'
  | 'responsive-number'
  | 'array'
  | 'icon';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  defaultValue?: any;
  options?: SelectOption[];
  placeholder?: string;
  description?: string;
  arrayFields?: FieldSchema[];
}

export interface EditorSchema {
  fields: FieldSchema[];
}

export interface SectionCapabilities {
  responsive?: boolean;
  themeOverride?: boolean;
  animation?: boolean;
  productBinding?: boolean;
  collectionBinding?: boolean;
}

export interface SectionStyleOverrides {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  topSpacing?: 'none' | 'small' | 'medium' | 'large';
  bottomSpacing?: 'none' | 'small' | 'medium' | 'large';
}

export interface BaseSectionConfig {
  id: string;
  name: string;
  type: SectionType;
  enabled: boolean;
  displayOrder: number;
  visibilityStartDate?: string;
  visibilityEndDate?: string;
  desktopVisible: boolean;
  tabletVisible: boolean;
  mobileVisible: boolean;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number;
  textColor?: string;
  containerWidth?: 'narrow' | 'default' | 'wide' | 'full';
  // Outer Margins (4-sided: Top, Bottom, Left, Right — can be 0/none or custom px)
  marginTop?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | string;
  marginBottom?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | string;
  marginLeft?: 'none' | 'small' | 'medium' | 'large' | 'auto' | string;
  marginRight?: 'none' | 'small' | 'medium' | 'large' | 'auto' | string;
  marginTopPx?: number;
  marginBottomPx?: number;
  marginLeftPx?: number;
  marginRightPx?: number;

  // Inner Padding (4-sided: Top, Bottom, Left, Right — can be 0/none or custom px)
  topSpacing?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | string;
  bottomSpacing?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | string;
  paddingLeft?: 'none' | 'small' | 'medium' | 'large' | string;
  paddingRight?: 'none' | 'small' | 'medium' | 'large' | string;
  paddingX?: 'none' | 'small' | 'standard' | 'spacious' | string;
  paddingTopPx?: number;
  paddingBottomPx?: number;
  paddingLeftPx?: number;
  paddingRightPx?: number;
  paddingXPx?: number;
  sectionHeight?: 'auto' | 'small' | 'medium' | 'large' | 'screen' | string;
  minHeightPx?: number;
  contentPadding?: 'none' | 'compact' | 'standard' | 'spacious';
  eyebrow?: string;
  heading?: string;
  description?: string;
  headingAlignment?: 'left' | 'center' | 'right';
  contentAlignment?: 'left' | 'center' | 'right';
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  animationPreset?: 'NONE' | 'FADE' | 'FADE_UP' | 'FADE_DOWN' | 'SLIDE_LEFT' | 'SLIDE_RIGHT' | 'IMAGE_ZOOM';
  analyticsId?: string;
  styleOverrides?: SectionStyleOverrides;
}

export type HeroLayoutMode =
  | 'SINGLE_SLIDE'
  | 'CAROUSEL'
  | 'SPLIT_LEFT'
  | 'SPLIT_RIGHT'
  | 'FULLSCREEN_VIDEO'
  | 'CARDS_OVERLAY';

export type DescriptionLayout =
  | 'default'
  | 'boxed-glass'
  | 'badge-pill'
  | 'quote'
  | 'minimal';

export interface HeroSlide {
  id: string;
  eyebrow?: string;
  heading?: string;
  subTitle?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  mobileMediaUrl?: string;
  posterImage?: string;
  altText?: string;
  overlayOpacity?: number;
  contentPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface HeroConfig extends BaseSectionConfig {
  layoutMode?: HeroLayoutMode;
  descriptionLayout?: DescriptionLayout;
  subTitle?: string;
  desktopImage?: string;
  tabletImage?: string;
  mobileImage?: string;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterImage?: string;
  altText?: string;
  overlayOpacity?: number;
  heroHeight?: 'auto' | 'small' | 'medium' | 'large' | 'screen';
  contentPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  autoplay?: boolean;
  autoplayInterval?: number;
  showNavigationArrows?: boolean;
  showPaginationDots?: boolean;
  slides?: HeroSlide[];
}

export interface CategoryCardItem {
  id: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  categorySlug: string;
  categoryId?: string;
  image: string;
  mobileImage?: string;
  hoverImage?: string;
  altText?: string;
  link: string;
  ctaText?: string;
  displayOrder: number;
  enabled: boolean;
  overlayOpacity?: number;
  cardRadius?: string;
  cardRadiusPx?: number;
}

export interface CategoryGridConfig extends BaseSectionConfig {
  aspectRatio?: 'square' | 'portrait' | 'tall' | 'landscape' | 'wide';
  columnsDesktop?: 2 | 3 | 4 | 6;
  columnsTablet?: 2 | 3;
  columnsMobile?: 1 | 2;
  cardRadius?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | 'full' | string;
  cardRadiusPx?: number;
  cardShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  cardHoverEffect?: 'zoom' | 'zoom-lg' | 'lift' | 'glow' | 'none' | string;
  cardGap?: 'small' | 'medium' | 'large' | 'flush' | string;
  cardOverlayOpacity?: number;
  cardEyebrow?: string;
  cardCtaText?: string;
  showCardCta?: boolean;
  showCardEyebrow?: boolean;
  items: CategoryCardItem[];
}

export interface ProductCardConfig {
  showName: boolean;
  showPrice: boolean;
  showCompareAtPrice: boolean;
  showDiscount: boolean;
  showCategory: boolean;
  showCollection: boolean;
  showRating: boolean;
  showReviewCount: boolean;
  showBadges: boolean;
  showAvailability: boolean;
  showQuickAdd: boolean;
  showWishlist: boolean;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  hoverImageEnabled: boolean;
  quickViewEnabled: boolean;
}

export interface ProductGridConfig extends BaseSectionConfig {
  columnsDesktop: 2 | 3 | 4 | 5 | 6;
  columnsTablet: 2 | 3;
  columnsMobile: 1 | 2;
  gapDesktop: 'small' | 'medium' | 'large';
  gapMobile: 'small' | 'medium' | 'large';
  maxProducts: number;
  productsPerPage: number;
  productSource: 'all' | 'category' | 'collection' | 'featured' | 'bestsellers' | 'new_arrivals' | 'offers' | 'festive' | 'limited' | string;
  sourceId?: string;
  attributeName?: string;
  attributeValue?: string;
  sortBy: 'manual' | 'newest' | 'price_asc' | 'price_desc' | 'popularity';
  cardConfig: ProductCardConfig;
}

export type EditorialLayoutMode =
  | 'image-left'
  | 'image-right'
  | 'manifesto-card'
  | 'dark-split'
  | 'ritual-checklist'
  | 'checklist-split'
  | 'full-width-overlay'
  | 'two-column';

export interface EditorialBannerConfig extends BaseSectionConfig {
  layout: EditorialLayoutMode;
  image: string;
  secondaryImage?: string;
  authorName?: string;
  publishDate?: string;
  badgeText?: string;
  checklistItems?: string[];
  checklistText?: string;
  cardTheme?: 'dark' | 'light' | 'auto';
}

export interface PromoBannerConfig extends BaseSectionConfig {
  badgeText?: string;
  promoCode?: string;
  discountText?: string;
  countdownEndDate?: string;
  bannerImage?: string;
}

export interface SeasonalSaleGridConfig extends BaseSectionConfig {
  campaignId?: string;
  badgeText?: string;
  countdownEndsAt?: string;
  bannerImageUrl?: string;
}

export type AnySectionConfig = BaseSectionConfig & Record<string, any>;

export type ColumnType =
  | 'TEXT'
  | 'NUMBER'
  | 'CURRENCY'
  | 'DATE'
  | 'DATETIME'
  | 'IMAGE'
  | 'STATUS'
  | 'BADGE'
  | 'BOOLEAN'
  | 'USER'
  | 'PRODUCT'
  | 'ORDER'
  | 'CATEGORY'
  | 'LINK'
  | 'ACTION';

export interface TableColumnConfig {
  id: string;
  label: string;
  field: string;
  type: ColumnType;
  order: number;
  width?: string;
  alignment: 'left' | 'center' | 'right';
  sortable: boolean;
  filterable: boolean;
  searchable: boolean;
  visible: boolean;
  mobileVisible: boolean;
  sticky?: boolean;
}

export interface TableConfig {
  id: string;
  name: string;
  enabled: boolean;
  columns: TableColumnConfig[];
  actions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    duplicate: boolean;
    approve: boolean;
    export: boolean;
  };
}

export interface AnnouncementBarConfig extends BaseSectionConfig {
  message: string;
  linkUrl?: string;
  ctaText?: string;
  dismissible: boolean;
  startDate?: string;
  endDate?: string;
}

export interface SiteDesignTokens {
  primaryFont: string;
  headingFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  destructiveColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  borderWidth: 'none' | 'thin' | 'medium' | 'thick';
  shadowStyle: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glass';
  buttonStyle: 'solid' | 'outline' | 'pill' | 'minimal';
  cardStyle: 'square' | 'rounded' | 'bordered' | 'shadow';
}

export interface InstagramPostItem {
  id: string;
  imageUrl: string;
  postUrl?: string;
  caption?: string;
  likesCount?: number;
}

export interface InstagramSettingsConfig {
  enabled: boolean;
  handle: string;
  followUrl: string;
  posts: InstagramPostItem[];
}

export interface PageConfig {
  version?: number;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  sections: AnySectionConfig[];
}

