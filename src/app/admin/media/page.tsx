import * as React from 'react';
import { getMediaFilesAction } from '@/app/actions/media-actions';
import { Heading, Text } from '@/components/ui/typography';
import { MediaManagerView } from '@/components/admin/media-manager-view';
import { connection } from 'next/server';

export default async function AdminMediaPage() {
  await connection();

  const mediaRes = await getMediaFilesAction();

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Media & Content Files
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Manage product images, brand assets, supplier documents, and Cloudflare R2 media storage.
        </Text>
      </div>

      {/* Main Shopify-style Media Manager View */}
      <MediaManagerView initialFiles={mediaRes.files} initialKpis={mediaRes.kpis} />
    </div>
  );
}
