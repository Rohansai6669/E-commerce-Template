/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Link from 'next/link';
import { Heading, Text } from '@/components/ui/typography';
import { Grid } from '@/components/layout/grid';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Stack } from '@/components/layout/stack';

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface FeaturedCategoriesProps {
  categories: FeaturedCategory[];
}

/**
 * Grid layout for catalog category shortcuts.
 */
export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <Section className="bg-muted/30">
      <Container>
        <Stack gap="8">
          <Stack gap="2">
            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight font-heading">
              Shop by Category
            </Heading>
            <Text className="text-sm text-muted-foreground">
              Explore our collections of hand-crafted quality apparel and tech gadgets.
            </Text>
          </Stack>

          <Grid cols="2" colsSm="2" colsMd="4" gap="4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="relative group rounded-md overflow-hidden h-40 bg-muted border border-border shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors z-[1]" />
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10 p-4 text-center">
                  <Heading level={3} className="text-white text-base md:text-lg font-bold font-heading drop-shadow-sm">
                    {cat.name}
                  </Heading>
                </div>
              </Link>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
export default FeaturedCategories;
