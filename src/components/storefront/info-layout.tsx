import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';

interface InfoLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const SIDE_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Returns & Refunds', href: '/refund-policy' },
];

/**
 * Standard layout for storefront static informational pages.
 * Includes a sidebar links column and content block with rich aesthetics.
 */
export function InfoLayout({ title, subtitle, children }: InfoLayoutProps) {
  return (
    <Container className="py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-1 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Customer Care
          </Text>
          {SIDE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Content Box */}
        <div className="flex-1 flex flex-col gap-6 max-w-3xl">
          <div className="flex flex-col gap-2 pb-4 border-b border-slate-850">
            <Heading level={1} className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {title}
            </Heading>
            {subtitle && (
              <Text className="text-sm text-slate-400">
                {subtitle}
              </Text>
            )}
          </div>
          <article className="prose prose-invert prose-slate text-sm text-slate-300 leading-relaxed space-y-4">
            {children}
          </article>
        </div>
      </div>
    </Container>
  );
}

export default InfoLayout;
