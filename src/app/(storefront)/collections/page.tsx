import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { Heading, Text } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/feedback/empty-state';
import { fetchCollectionsList } from '@/core/storefront/taxonomy-catalog';
import { Icon } from '@/components/ui/icon';

export const metadata = {
  title: 'Curated Collections | LEXIDO',
  description: 'Explore limited editorial drops, seasonal capsules, and signature design collections.',
};

/**
 * Collections gallery directory page.
 * Displays all active collections with live item counts and direct links to collection PDPs.
 */
export default async function CollectionsPage() {
  const collectionsList = await fetchCollectionsList();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
  ];

  return (
    <Container className="py-10 max-w-7xl">
      <Stack gap="8">
        <Breadcrumb items={breadcrumbs} />

        {/* Page Header */}
        <div className="border-b border-border pb-8">
          <p className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase mb-2">
            Curated Drops & Capsules
          </p>
          <Heading level={1} className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading uppercase">
            Collections
          </Heading>
          <Text className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Engineered silhouettes and seasonal curation. Explore thematic drops crafted for modern luxury.
          </Text>
        </div>

        {collectionsList.length === 0 ? (
          <EmptyState
            icon="Layers"
            title="No Collections Found"
            description="Our curators are currently preparing new seasonal drops. Check back soon or browse all products."
            actionLabel="Explore All Products"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {collectionsList.map((col) => {
              const defaultImage =
                col.imageUrl ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop';

              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={defaultImage}
                      alt={col.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground font-semibold text-xs">
                        {col.productCount} {col.productCount === 1 ? 'Piece' : 'Pieces'}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h2 className="text-lg font-bold uppercase tracking-tight text-foreground font-heading group-hover:text-primary transition-colors">
                        {col.name}
                      </h2>
                      {col.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
                      <span>Explore Collection</span>
                      <Icon name="ArrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Stack>
    </Container>
  );
}

