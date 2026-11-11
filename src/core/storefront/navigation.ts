export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  columnNumber?: number;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export interface NavigationSection {
  label: string;
  href?: string;
  groups?: NavigationGroup[];
  featured?: {
    title: string;
    description: string;
    imageUrl: string;
    href: string;
    actionLabel: string;
  };
}

export const navigationConfig: NavigationSection[] = [
  {
    label: 'MEN',
    href: '/audience/men',
    groups: [
      {
        title: 'STYLES & COLLECTIONS',
        items: [
          { label: 'Streetwear', href: '/collections/streetwear' },
          { label: 'Gym Wear', href: '/men/gymwear' },
          { label: 'Old Money', href: '/collections/old-money' },
          { label: 'Casual & Daily', href: '/men/casual' },
          { label: 'Formal', href: '/men/formal' },
          { label: 'Winter Collection', href: '/collections/winter' },
        ],
      },
      {
        title: 'STREETWEAR PRODUCTS',
        items: [
          { label: 'Oversized T-Shirts', href: '/men/streetwear/oversized-t-shirts' },
          { label: 'Graphic T-Shirts', href: '/men/streetwear/graphic-t-shirts' },
          { label: 'Heavyweight Hoodies', href: '/men/streetwear/hoodies' },
          { label: 'Baggy Jeans', href: '/men/streetwear/jeans' },
          { label: 'Cargo Pants', href: '/men/streetwear/cargo-pants' },
          { label: 'Jackets & Puffers', href: '/men/streetwear/jackets' },
        ],
      },
    ],
    featured: {
      title: 'DISCOVER STREETWEAR',
      description: 'Engineered oversized fits, 450 GSM cottons & atelier finish.',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      href: '/collections/streetwear',
      actionLabel: 'EXPLORE EDIT',
    },
  },
  {
    label: 'WOMEN',
    href: '/audience/women',
    groups: [
      {
        title: 'STYLES & COLLECTIONS',
        items: [
          { label: 'Streetwear', href: '/collections/streetwear' },
          { label: 'Gym Wear', href: '/women/gymwear' },
          { label: 'Old Money', href: '/collections/old-money' },
          { label: 'Casual & Daily', href: '/women/casual' },
          { label: 'Formal Tailoring', href: '/women/formal' },
          { label: 'Winter Collection', href: '/collections/winter' },
        ],
      },
      {
        title: 'WOMEN ESSENTIALS',
        items: [
          { label: 'Oversized T-Shirts', href: '/women/streetwear/oversized-t-shirts' },
          { label: 'Cropped Tees', href: '/women/tops/cropped-tees' },
          { label: 'Baggy Jeans', href: '/women/denim/baggy-jeans' },
          { label: 'Cargo Pants', href: '/women/streetwear/cargo-pants' },
          { label: 'Hoodies & Sweats', href: '/women/hoodies' },
          { label: 'Pleated Shorts', href: '/women/shorts' },
        ],
      },
    ],
    featured: {
      title: 'MINIMALIST SILHOUETTES',
      description: 'Tailored oversized coats, organic silk & signature cropped cuts.',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
      href: '/audience/women',
      actionLabel: 'SHOP WOMEN',
    },
  },
  {
    label: 'KIDS',
    href: '/audience/kids',
    groups: [
      {
        title: 'AUDIENCE TAXONOMY',
        items: [
          { label: 'Baby Kit (0–2Y)', href: '/kids/baby-kit' },
          { label: 'Boys (3–12Y)', href: '/kids/boys' },
          { label: 'Girls (3–12Y)', href: '/kids/girls' },
          { label: 'Winter Wear', href: '/kids/winter' },
          { label: "Kids' Accessories", href: '/kids/accessories' },
        ],
      },
      {
        title: 'BABY KIT ESSENTIALS',
        items: [
          { label: 'Onesies & Rompers', href: '/kids/baby-kit/onesies' },
          { label: 'Sleep Suits', href: '/kids/baby-kit/sleep-suits' },
          { label: 'Baby Tees', href: '/kids/baby-kit/baby-tees' },
          { label: 'Soft Booties & Caps', href: '/kids/baby-kit/booties' },
          { label: 'Bibs & Mittens', href: '/kids/baby-kit/bibs' },
        ],
      },
    ],
    featured: {
      title: 'JUNIOR ESSENTIALS',
      description: 'Durable organic cotton apparel & newborn nursery gifts.',
      imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800&auto=format&fit=crop',
      href: '/audience/kids',
      actionLabel: 'EXPLORE KIDS',
    },
  },
  {
    label: 'COLLECTIONS',
    href: '/collections/all',
    groups: [
      {
        title: 'CURATED EDITS',
        items: [
          { label: 'Streetwear Edit', href: '/collections/streetwear' },
          { label: 'Gym & Athletics', href: '/collections/gymwear' },
          { label: 'Old Money Luxury', href: '/collections/old-money' },
          { label: 'Winter Drop', href: '/collections/winter' },
        ],
      },
    ],
  },
  {
    label: 'FESTIVE & LIMITED',
    href: '/products?edition=limited',
    groups: [
      {
        title: 'SPECIAL EDITIONS',
        items: [
          { label: 'Diwali Festive Collection', href: '/products?festival=diwali' },
          { label: 'Limited Edition Drops', href: '/products?edition=limited' },
          { label: 'Exclusive Capsule Bundles', href: '/products?collection=festive' },
        ],
      },
    ],
  },
  {
    label: 'OFFERS & DEALS',
    href: '/products?availability=in-stock',
    groups: [
      {
        title: 'SAVINGS & PROMOTIONS',
        items: [
          { label: 'Special Offers', href: '/products?tag=offers' },
          { label: 'Festive Deals', href: '/products?tag=festive-deals' },
          { label: 'Flash Sale', href: '/products?tag=flash-sale' },
        ],
      },
    ],
  },
  {
    label: 'SHOP ALL',
    href: '/products',
  },
];
