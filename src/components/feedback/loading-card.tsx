import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout/stack';

/**
 * Skeletal loading block representing standard Card layouts.
 */
export function LoadingCard() {
  return (
    <Card className="w-full border-border shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <Stack gap="3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4.5 w-2/3" />
        </Stack>
      </CardContent>
    </Card>
  );
}
export default LoadingCard;
