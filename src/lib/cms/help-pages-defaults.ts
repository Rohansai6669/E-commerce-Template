import {
  FaqConfig,
  HelpCenterConfig,
  ShippingPolicyConfig,
  ReturnsPolicyConfig,
  PrivacyPolicyConfig,
  SupportTicketConfig,
  TrackOrderConfig,
} from '@/types/help-pages';

export const defaultFaqConfig: FaqConfig = {
  title: 'FREQUENTLY ASKED QUESTIONS',
  subtitle: 'Find comprehensive guidance on orders, dispatch, fit specifications, and customer care.',
  categories: [
    {
      id: 'cat-orders',
      name: 'Orders & Dispatch',
      items: [
        {
          id: 'faq-1',
          question: 'How do I track my order status?',
          answer:
            'Once your order is dispatched, you will receive a confirmation email and SMS containing your airway bill (AWB) number and live tracking link. You can also monitor your parcel anytime through our Track Order tool using your Order ID.',
        },
        {
          id: 'faq-2',
          question: 'What are your delivery timelines across India?',
          answer:
            'Metro cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive deliveries within 2–3 business days. Non-metro and regional locations arrive within 4–6 business days.',
        },
        {
          id: 'faq-3',
          question: 'Can I modify or cancel my order after placing it?',
          answer:
            'Orders enter our automated fulfillment pipeline within 60 minutes. If you need to modify sizing or shipping addresses, contact our concierge immediately at hello@lexido.in or raise an urgent support ticket.',
        },
      ],
    },
    {
      id: 'cat-returns',
      name: 'Returns & Exchanges',
      items: [
        {
          id: 'faq-4',
          question: 'What is Lexido’s return policy window?',
          answer:
            'We offer a complimentary 15-day doorstep return and exchange window from the date of delivery. Items must remain unwashed, unworn, and retain all original branding tags and garment packaging.',
        },
        {
          id: 'faq-5',
          question: 'How long do refunds take to reflect in my bank account?',
          answer:
            'Once returned items pass quality inspection at our fulfillment facility (24–48 hours after pickup), refunds are initiated immediately. Bank cards, UPI, and Net Banking typically reflect within 3–5 business days.',
        },
      ],
    },
    {
      id: 'cat-sizing',
      name: 'Sizing & Garment Care',
      items: [
        {
          id: 'faq-6',
          question: 'How do Lexido silhouettes fit?',
          answer:
            'Most Lexido hoodies, tees, and outerwear feature our signature relaxed boxy or drop-shoulder streetwear cut. For an oversized fit, select your true size. For a tailored silhouette, we recommend sizing down one step.',
        },
        {
          id: 'faq-7',
          question: 'What are the recommended washing instructions?',
          answer:
            'To preserve custom dyed cotton fibers and heavyweight fleece grams, machine wash inside out in cold water (30°C). Tumble dry on low or hang dry in the shade. Avoid direct iron on silicone or puff prints.',
        },
      ],
    },
    {
      id: 'cat-payments',
      name: 'Payments & Security',
      items: [
        {
          id: 'faq-8',
          question: 'What payment options are accepted?',
          answer:
            'We accept all major Credit/Debit cards (Visa, MasterCard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pincodes across India.',
        },
        {
          id: 'faq-9',
          question: 'Is my payment transaction secure?',
          answer:
            'All transactions are processed via bank-grade 256-bit SSL encrypted PCI-DSS Level 1 compliant gateways. We never store raw card numbers or CVVs on our systems.',
        },
      ],
    },
  ],
};

export const defaultHelpCenterConfig: HelpCenterConfig = {
  heroTitle: 'LEXIDO CONCIERGE & CLIENT CARE',
  heroSubtitle: 'Dedicated assistance for orders, sizing recommendations, courier dispatches, and returns.',
  supportEmail: 'hello@lexido.in',
  supportPhone: '+91 (0) 80 4567 8900',
  workingHours: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
  quickCards: [
    {
      id: 'qc-track',
      title: 'Track Your Order',
      description: 'Check live courier movement and estimated delivery date with your Order ID.',
      href: '/track-order',
      badge: 'Real-time',
    },
    {
      id: 'qc-returns',
      title: 'Returns & Exchanges',
      description: 'Hassle-free 15-day doorstep pickup and instant size exchanges.',
      href: '/returns',
      badge: '15-Day Window',
    },
    {
      id: 'qc-shipping',
      title: 'Shipping Guidelines',
      description: 'Complimentary shipping terms above ₹2,000, express transit, and coverage.',
      href: '/shipping',
    },
    {
      id: 'qc-ticket',
      title: 'Raise Support Ticket',
      description: 'Need customized help? Connect directly with our atelier support desk.',
      href: '/support',
      badge: '4h Response',
    },
    {
      id: 'qc-faq',
      title: 'Browse All FAQs',
      description: 'Instant answers to the most common product, ordering, and payment inquiries.',
      href: '/faq',
    },
    {
      id: 'qc-privacy',
      title: 'Privacy & Security',
      description: 'Learn how your sensitive personal data and payment credentials are protected.',
      href: '/privacy',
    },
  ],
  highlightFaqs: [
    {
      id: 'hf-1',
      question: 'How do I initiate a return or exchange?',
      answer: 'Visit our Returns page or head to your Account Orders section to trigger a doorstep pickup in one click.',
    },
    {
      id: 'hf-2',
      question: 'What is the cutoff time for same-day dispatch?',
      answer: 'Orders confirmed prior to 1:00 PM IST on business days are processed for dispatch on the same afternoon.',
    },
    {
      id: 'hf-3',
      question: 'How do I redeem my promotion or gift coupon?',
      answer: 'Enter your promo code in the coupon field during checkout. Verified discounts deduct instantly from your cart subtotal.',
    },
  ],
};

export const defaultShippingPolicyConfig: ShippingPolicyConfig = {
  title: 'SHIPPING & DISPATCH POLICY',
  subtitle: 'Transparent timelines, premium courier partnerships, and complimentary shipping across India.',
  standardRate: 100,
  freeShippingThreshold: 2000,
  expressRate: 250,
  metroDeliveryTime: '2–3 Business Days',
  nationalDeliveryTime: '4–6 Business Days',
  courierPartners: ['Blue Dart Express', 'Delhivery Priority', 'DTDC Air Cargo'],
  sections: [
    {
      id: 'sec-ship-1',
      heading: 'Dispatch Timelines & Processing',
      content:
        'All confirmed orders undergo precision quality check and packing at our centralized warehouse within 24–36 business hours. During festive drops and seasonal limited collections, processing may take up to 48 hours.',
    },
    {
      id: 'sec-ship-2',
      heading: 'Complimentary Shipping Threshold',
      content:
        'We are pleased to provide complimentary standard ground delivery on all domestic orders totaling ₹2,000 or above. For orders beneath this threshold, a flat ₹100 freight fee is applied at checkout.',
    },
    {
      id: 'sec-ship-3',
      heading: 'Courier Transit & Tracking',
      content:
        'We partner exclusively with Tier-1 logistics carriers including Blue Dart, Delhivery, and DTDC. An automated dispatch SMS and email with an active AWB tracking link is triggered the moment the courier scans your package out of our depot.',
    },
    {
      id: 'sec-ship-4',
      heading: 'Damaged or Tampered Parcels',
      content:
        'If the exterior security tape on your Lexido shipping box appears damaged, broken, or tampered with at the time of delivery, please refuse delivery and immediately notify us at hello@lexido.in with photographic evidence.',
    },
  ],
};

export const defaultReturnsPolicyConfig: ReturnsPolicyConfig = {
  title: 'RETURNS & EXCHANGES POLICY',
  subtitle: '15-day complimentary doorstep reverse pickups with direct sizing replacement or refund.',
  returnWindowDays: 15,
  pickupTimeline: '24–48 Hours',
  refundTimeline: '3–5 Business Days',
  conditions: [
    'Merchandise must be unused, unwashed, and free of fragrance, lint, or makeup stains.',
    'Original brand tags, product packaging sleeve, and protective seals must remain attached.',
    'Footwear must include the original shoe box undamaged and in resalable condition.',
    'Accessories, socks, and intimate wear are final sale for hygiene reasons.',
  ],
  sections: [
    {
      id: 'sec-ret-1',
      heading: '15-Day Doorstep Return Window',
      content:
        'We stand behind every piece crafted by Lexido. If you are not completely satisfied with the fit or feel of your garment, you may request a return or size exchange within 15 days of confirmed delivery.',
    },
    {
      id: 'sec-ret-2',
      heading: 'Complimentary Reverse Pickup',
      content:
        'Once a return request is authorized, our logistics courier will visit your delivery address within 24–48 hours for doorstep pickup. You will receive an SMS confirmation containing courier agent details.',
    },
    {
      id: 'sec-ret-3',
      heading: 'Quality Audit & Refund Disbursal',
      content:
        'Returned garments undergo a rapid physical audit upon reaching our fulfillment hub. Following approval, refunds are credited back to your original source (UPI, Credit/Debit card, or Net Banking) within 3–5 business days.',
    },
    {
      id: 'sec-ret-4',
      heading: 'Size & Silhouette Exchanges',
      content:
        'Prefer a different size or alternative colorway? Size exchanges are prioritized with zero additional shipping charges. Your replacement item is reserved and dispatched the moment the return pickup is registered.',
    },
  ],
};

export const defaultPrivacyPolicyConfig: PrivacyPolicyConfig = {
  title: 'PRIVACY & DATA PROTECTION',
  subtitle: 'How Lexido collects, encrypts, and handles your data with the highest industry standards.',
  lastUpdated: 'November 2026',
  contactEmail: 'privacy@lexido.in',
  sections: [
    {
      id: 'sec-priv-1',
      heading: 'Information We Collect',
      content:
        'When you shop with Lexido, we collect personal information you provide such as your name, billing and shipping address, contact phone number, and email. We also collect automated diagnostic metadata including IP address, browser type, and session cookies to ensure frictionless checkout.',
    },
    {
      id: 'sec-priv-2',
      heading: 'Payment Security & Encryption',
      content:
        'Lexido does not store, process, or view full credit or debit card numbers on our internal databases. All transactions are routed directly through PCI-DSS Level 1 certified gateway partners (Razorpay / Stripe) using 256-bit SSL tokenization.',
    },
    {
      id: 'sec-priv-3',
      heading: 'How We Use Your Data',
      content:
        'Your information is used solely to process your orders, fulfill delivery commitments, provide customer support updates, and communicate drop announcements (only if opted in). We never sell, rent, or trade your personal details to third-party marketing brokers.',
    },
    {
      id: 'sec-priv-4',
      heading: 'Your Rights & Consent Withdrawal',
      content:
        'You retain full sovereignty over your personal data. You may request access to, correction of, or permanent deletion of your customer profile at any time by contacting our Data Protection Officer at privacy@lexido.in.',
    },
  ],
};

export const defaultSupportTicketConfig: SupportTicketConfig = {
  title: 'RAISE A CLIENT SUPPORT TICKET',
  subtitle: 'Connect directly with our atelier customer care team. Average response time is within 4 hours.',
  supportEmail: 'hello@lexido.in',
  workingHours: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
  slaNotice: 'Standard tickets receive personalized attention within 4 business hours. Urgent dispatch inquiries receive priority handling.',
  categories: [
    'Order Delivery & Delay',
    'Return or Size Exchange',
    'Defective / Damaged Item',
    'Payment or Refund Query',
    'Product Sizing & Drop Details',
    'Corporate & Bulk Gifting',
    'Other General Assistance',
  ],
};

export const defaultTrackOrderConfig: TrackOrderConfig = {
  title: 'TRACK YOUR DISPATCH',
  subtitle: 'Enter your Order Reference Number and Email Address to retrieve live transit waybill status.',
  lookupNotice: 'Please allow up to 12 hours after order confirmation for your tracking number to synchronize with courier hubs.',
  courierPartnersNotice: 'Delivered via our authorized Tier-1 courier network: Blue Dart, Delhivery, and DTDC.',
  helpLinkText: 'Need assistance locating your Order ID? Check your order confirmation email or connect with our support desk.',
};

