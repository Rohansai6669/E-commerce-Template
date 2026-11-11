import * as React from 'react';
import { getCurrentUser } from '@/core/auth/session';
import { wishlistRepository } from '@/core/wishlist/wishlist.repository';
import { ProductCard } from '@/components/commerce/product-card';
import { redirect } from 'next/navigation';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { connection } from 'next/server';

export const metadata = {
  title: 'My Wishlist | Storefront',
  description: 'Manage your saved products list.',
};

/**
 * Server Component serving the /account/wishlist page.
 */
export default async function AccountWishlistPage() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const items = await wishlistRepository.getWishlist(user.id);

  return (
    <Stack gap="5" className="w-full">
      <div>
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          My Wishlist
        </Heading>
        <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
          Products you have saved for later.
        </Text>
      </div>

      {items.length === 0 ? (
        <Card className="border-border bg-card shadow-xs text-center py-12 w-full">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-4">
              <Icon name="Heart" className="h-6 w-6" />
            </div>
            <Heading level={3} className="text-sm font-bold text-foreground">Your wishlist is empty.</Heading>
            <Text className="text-xs text-muted-foreground mt-1 max-w-xs">
              Explore products and click the heart icon to save items.
            </Text>
            <Button asChild size="sm" className="mt-4 font-semibold text-xs cursor-pointer">
              <Link href="/products">Explore Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {items.map((item) => (
            <ProductCard key={item.productId} product={item.product} />
          ))}
        </div>
      )}
    </Stack>
  );
}
