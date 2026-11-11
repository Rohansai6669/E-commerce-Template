import * as React from 'react';
import Link from 'next/link';
import { Text } from '@/components/ui/typography';

/**
 * Footer column links.
 */
export function FooterLinks() {
  const sections = [
    {
      title: 'Storefront',
      items: [
        { label: 'All Products', href: '/products' },
        { label: 'Apparel Catalog', href: '/products?category=apparel' },
        { label: 'Tech Catalog', href: '/products?category=electronics' },
      ],
    },
    {
      title: 'My Store',
      items: [
        { label: 'Profile Account', href: '/account' },
        { label: 'Track Orders', href: '/account/orders' },
        { label: 'Shopping Cart', href: '/cart' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About Store', href: '/about' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {sections.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground/85 font-heading">
            {section.title}
          </Text>
          <div className="flex flex-col gap-2">
            {section.items.map((item, itemIdx) => (
              <Link
                key={itemIdx}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default FooterLinks;
