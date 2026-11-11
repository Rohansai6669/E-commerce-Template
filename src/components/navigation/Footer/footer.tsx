import * as React from 'react';
import { FooterLinks } from './footer-links';
import { FooterSocial } from './footer-social';
import { Container } from '@/components/layout/container';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/typography';

/**
 * Storefront footer component.
 */
export function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <Container className="py-12 flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-sm">
          <Text className="text-lg font-bold tracking-tight text-foreground font-heading">
            Storefront
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            High-performance customizable storefront template engineered with Next.js, Supabase, and Drizzle.
          </Text>
          <FooterSocial />
        </div>

        <FooterLinks />
      </Container>

      <Separator />

      <Container className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Text className="text-xs text-muted-foreground">
          &copy; 2026 Storefront. All rights reserved.
        </Text>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
        </div>
      </Container>
    </footer>
  );
}
export default Footer;
