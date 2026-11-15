export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

export interface FooterSocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'x' | 'pinterest' | 'tiktok' | 'youtube' | 'linkedin' | 'custom';
  label: string;
  url: string;
  enabled: boolean;
}

export interface FooterConfig {
  // Brand Info
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  logoType: 'text' | 'image';
  logoImageUrl: string;
  logoText: string;

  // Dynamic Navigation Columns
  columns: FooterColumn[];

  // Reach Us / Contact
  contactTitle: string;
  contactEmail: string;
  contactHours: string;
  contactPhone?: string;

  // Newsletter Box
  showNewsletter: boolean;
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  newsletterSuccessMessage: string;

  // Social Channels
  showSocialLinks: boolean;
  socialHeading: string;
  socialLinks: FooterSocialLink[];

  // Bottom Bar
  copyrightText: string;
  taglineText: string;
  taglineHighlight: string;
  showPaymentBadges: boolean;

  // Appearance & Styling
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  borderTopWidth: 'none' | 'thin' | 'medium' | 'thick';
  borderStyle: 'solid' | 'dashed' | 'none';
  containerWidth: 'boxed' | 'wide' | 'full';
  fontScale?: 'compact' | 'normal' | 'spacious';
}

export const defaultFooterConfig: FooterConfig = {
  brandName: 'LEXIDO',
  brandTagline: 'PREMIUM STREETWEAR',
  brandDescription: 'Crafted for those who move different. Premium streetwear made in India, designed for the world.',
  logoType: 'text',
  logoImageUrl: '',
  logoText: 'LEXIDO',

  columns: [
    {
      id: 'col-shop',
      title: 'SHOP',
      links: [
        { id: 'lnk-1', label: 'Men', url: '/products?category=men' },
        { id: 'lnk-2', label: 'Women', url: '/products?category=women' },
        { id: 'lnk-3', label: 'Denim', url: '/products?category=denim' },
        { id: 'lnk-4', label: 'Hoodies', url: '/products?category=hoodies' },
      ],
    },
    {
      id: 'col-explore',
      title: 'EXPLORE',
      links: [
        { id: 'lnk-5', label: 'Collections', url: '/collections' },
        { id: 'lnk-6', label: 'Accessories', url: '/products?category=accessories' },
        { id: 'lnk-7', label: 'Help', url: '/help' },
        { id: 'lnk-8', label: 'About', url: '/about' },
      ],
    },
    {
      id: 'col-help',
      title: 'HELP',
      links: [
        { id: 'lnk-9', label: 'Help Center', url: '/help' },
        { id: 'lnk-10', label: 'Track Order', url: '/track-order' },
        { id: 'lnk-11', label: 'FAQs', url: '/faq' },
        { id: 'lnk-12', label: 'Raise Ticket', url: '/support' },
        { id: 'lnk-13', label: 'Shipping', url: '/shipping' },
        { id: 'lnk-14', label: 'Returns', url: '/returns' },
        { id: 'lnk-15', label: 'Privacy', url: '/privacy' },
      ],
    },
  ],

  contactTitle: 'REACH US',
  contactEmail: 'hello@lexido.in',
  contactHours: 'Mon–Sat, 10am–7pm IST',
  contactPhone: '',

  showNewsletter: true,
  newsletterHeading: 'BECOME PART OF LEXIDO',
  newsletterDescription: 'Subscribe to receive private drop alerts, runway invites, and exclusive editorial releases.',
  newsletterPlaceholder: 'your@email.com',
  newsletterButtonText: 'SUBSCRIBE',
  newsletterSuccessMessage: '✓ THANK YOU FOR SUBSCRIBING TO THE LEXIDO INNER CIRCLE.',

  showSocialLinks: true,
  socialHeading: 'FOLLOW',
  socialLinks: [
    { id: 'soc-ig', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/lexido', enabled: true },
    { id: 'soc-fb', platform: 'facebook', label: 'Facebook', url: 'https://facebook.com', enabled: true },
    { id: 'soc-x', platform: 'x', label: 'X (Twitter)', url: 'https://x.com', enabled: true },
    { id: 'soc-pin', platform: 'pinterest', label: 'Pinterest', url: 'https://pinterest.com', enabled: true },
    { id: 'soc-tt', platform: 'tiktok', label: 'TikTok', url: 'https://tiktok.com', enabled: true },
    { id: 'soc-yt', platform: 'youtube', label: 'YouTube', url: 'https://youtube.com', enabled: true },
  ],

  copyrightText: '© 2026 LEXIDO. All rights reserved. Made in India.',
  taglineText: 'TAG',
  taglineHighlight: '@LEXIDO — FEATURED IN OUR NEXT DROP',
  showPaymentBadges: true,

  backgroundColor: '#000000',
  textColor: '#ffffff',
  mutedTextColor: '#a3a3a3',
  borderColor: '#171717',
  borderTopWidth: 'thin',
  borderStyle: 'solid',
  containerWidth: 'full',
  fontScale: 'normal',
};

export const FOOTER_PRESETS: {
  id: string;
  name: string;
  description: string;
  config: Partial<FooterConfig>;
}[] = [
  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe (Default)',
    description: 'Pitch black background with sleek high-contrast borders and white branding.',
    config: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      mutedTextColor: '#a3a3a3',
      borderColor: '#171717',
      borderTopWidth: 'thin',
      borderStyle: 'solid',
    },
  },
  {
    id: 'charcoal-atelier',
    name: 'Charcoal Atelier',
    description: 'Deep zinc slate surface with muted luxury typography and subtle dividers.',
    config: {
      backgroundColor: '#09090b',
      textColor: '#f4f4f5',
      mutedTextColor: '#71717a',
      borderColor: '#27272a',
      borderTopWidth: 'thin',
      borderStyle: 'solid',
    },
  },
  {
    id: 'crisp-minimalist',
    name: 'Crisp Minimalist (Light)',
    description: 'Clean light background with sharp slate black text and refined borders.',
    config: {
      backgroundColor: '#ffffff',
      textColor: '#09090b',
      mutedTextColor: '#71717a',
      borderColor: '#e4e4e7',
      borderTopWidth: 'thin',
      borderStyle: 'solid',
    },
  },
  {
    id: 'editorial-borderless',
    name: 'Editorial Borderless',
    description: 'Deep minimalist noir without top border for seamless endless flow.',
    config: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      mutedTextColor: '#9ca3af',
      borderColor: 'transparent',
      borderTopWidth: 'none',
      borderStyle: 'none',
    },
  },
];

