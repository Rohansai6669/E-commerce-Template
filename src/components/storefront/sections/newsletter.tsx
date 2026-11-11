'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading, Text } from '@/components/ui/typography';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Stack } from '@/components/layout/stack';

/**
 * Brand email subscription capture box.
 */
export function Newsletter() {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Newsletter subscription submitted for email: ${email}`);
    setEmail('');
  };

  return (
    <Section className="bg-card border-t border-border">
      <Container className="max-w-md text-center">
        <Stack gap="5" align="center">
          <Stack gap="2">
            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight font-heading">
              Subscribe to our Newsletter
            </Heading>
            <Text className="text-sm text-muted-foreground leading-relaxed font-sans">
              Stay updated on new collection arrivals, promo coupons, and catalog discounts.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
            <Input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md text-xs"
            />
            <Button type="submit" className="font-semibold cursor-pointer shrink-0">
              Subscribe
            </Button>
          </form>
        </Stack>
      </Container>
    </Section>
  );
}
export default Newsletter;
