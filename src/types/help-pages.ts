export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  items: FaqItem[];
}

export interface FaqConfig {
  title: string;
  subtitle: string;
  categories: FaqCategory[];
}

export interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface HelpCenterConfig {
  heroTitle: string;
  heroSubtitle: string;
  supportEmail: string;
  supportPhone: string;
  workingHours: string;
  quickCards: QuickActionCard[];
  highlightFaqs: FaqItem[];
}

export interface PolicySection {
  id: string;
  heading: string;
  content: string;
}

export interface ShippingPolicyConfig {
  title: string;
  subtitle: string;
  standardRate: number;
  freeShippingThreshold: number;
  expressRate: number;
  metroDeliveryTime: string;
  nationalDeliveryTime: string;
  courierPartners: string[];
  sections: PolicySection[];
}

export interface ReturnsPolicyConfig {
  title: string;
  subtitle: string;
  returnWindowDays: number;
  pickupTimeline: string;
  refundTimeline: string;
  conditions: string[];
  sections: PolicySection[];
}

export interface PrivacyPolicyConfig {
  title: string;
  subtitle: string;
  lastUpdated: string;
  contactEmail: string;
  sections: PolicySection[];
}

export interface SupportTicketConfig {
  title: string;
  subtitle: string;
  supportEmail: string;
  workingHours: string;
  slaNotice: string;
  categories: string[];
}

export interface TrackOrderConfig {
  title: string;
  subtitle: string;
  lookupNotice: string;
  courierPartnersNotice: string;
  helpLinkText: string;
}

