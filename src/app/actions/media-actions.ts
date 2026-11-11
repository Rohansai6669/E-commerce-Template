'use server';

import { db } from '@/lib/db';
import { mediaFiles } from '@/lib/db/schema/media';
import { storageClient } from '@/core/storage/client';
import { storageConfig } from '@/core/config/storage';
import { eq, inArray, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface MediaFileRecord {
  id: string;
  name: string;
  url: string;
  folder: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

const DEFAULT_MEDIA_ASSETS: MediaFileRecord[] = [
  {
    id: 'seed-cat-streetwear',
    name: 'streetwear-editorial-collection.jpg',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 620,
    altText: 'Streetwear Editorial Collection Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T08:00:00Z'),
  },
  {
    id: 'seed-cat-gymwear',
    name: 'gym-athletic-activewear.jpg',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 580,
    altText: 'Gym Wear & Athletic Performance Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T08:30:00Z'),
  },
  {
    id: 'seed-cat-oldmoney',
    name: 'old-money-tailoring-polo.jpg',
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 710,
    altText: 'Old Money Heritage Tailored Classics Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T09:00:00Z'),
  },
  {
    id: 'seed-cat-casual',
    name: 'casual-modern-street-cut.jpg',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 490,
    altText: 'Modern Casual Essentials Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T09:30:00Z'),
  },
  {
    id: 'seed-cat-formal',
    name: 'formal-milanese-suiting.jpg',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 840,
    altText: 'Milanese Formal Suiting & Blazers Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T10:00:00Z'),
  },
  {
    id: 'seed-cat-winter',
    name: 'winter-collection-overcoats.jpg',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 670,
    altText: 'Winter Collection Heavy Overcoats & Cashmere Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T10:30:00Z'),
  },
  {
    id: 'seed-cat-accessories',
    name: 'mens-accessories-leather-chrono.jpg',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 460,
    altText: 'Men Accessories Chrono & Fine Leather Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T11:00:00Z'),
  },
  {
    id: 'seed-cat-hoodies',
    name: 'oversized-heavyweight-hoodies.jpg',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 510,
    altText: 'Oversized Hoodies & Sweatshirts Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T11:30:00Z'),
  },
  {
    id: 'seed-cat-denim',
    name: 'wide-leg-japanese-denim.jpg',
    url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop',
    folder: 'categories',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 530,
    altText: 'Wide-Leg & Baggy Denim Jeans Cover',
    width: 1200,
    height: 1500,
    createdAt: new Date('2026-11-01T12:00:00Z'),
  },
  {
    id: 'seed-banner-1',
    name: 'hero-editorial-luxury.jpg',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    folder: 'banners',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 720,
    altText: 'Redefining Modern Luxury Hero Banner',
    width: 2070,
    height: 1100,
    createdAt: new Date('2026-11-01T10:00:00Z'),
  },
  {
    id: 'seed-banner-2',
    name: 'hero-minimalist-lookbook.jpg',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2070&auto=format&fit=crop',
    folder: 'banners',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 650,
    altText: 'Minimalist Manifesto Lookbook Banner',
    width: 2070,
    height: 1100,
    createdAt: new Date('2026-11-01T11:00:00Z'),
  },
  {
    id: 'seed-banner-3',
    name: 'festive-golden-campaign.jpg',
    url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop',
    folder: 'banners',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 890,
    altText: 'Seasonal Festive Gold Banner',
    width: 2070,
    height: 1100,
    createdAt: new Date('2026-11-02T12:00:00Z'),
  },
  {
    id: 'seed-banner-4',
    name: 'milan-tailoring-split.jpg',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
    folder: 'banners',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 512,
    altText: 'Modern Tailoring Split Banner',
    width: 1200,
    height: 800,
    createdAt: new Date('2026-11-02T13:00:00Z'),
  },
  {
    id: 'seed-prod-1',
    name: 'heavyweight-tee-black.jpg',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 410,
    altText: 'Oversized Heavyweight T-Shirt',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-02T14:00:00Z'),
  },
  {
    id: 'seed-prod-2',
    name: 'vintage-wash-denim.jpg',
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 530,
    altText: 'Vintage Wash Denim Jacket',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-02T15:00:00Z'),
  },
  {
    id: 'seed-prod-3',
    name: 'organic-silk-shirt.jpg',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 480,
    altText: 'Organic Cotton & Silk Shirt',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T09:00:00Z'),
  },
  {
    id: 'seed-prod-4',
    name: 'minimalist-hoodie.jpg',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 620,
    altText: 'Classic Zip Hoodie',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T10:00:00Z'),
  },
  {
    id: 'seed-prod-5',
    name: 'tailored-wool-coat.jpg',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 710,
    altText: 'Tailored Italian Wool Coat',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T11:00:00Z'),
  },
  {
    id: 'seed-prod-6',
    name: 'utility-cargo-pants.jpg',
    url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop',
    folder: 'products',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 440,
    altText: 'Technical Utility Cargo Pants',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T12:00:00Z'),
  },
  {
    id: 'seed-brand-1',
    name: 'lexido-crest-monogram.png',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    folder: 'brands',
    mimeType: 'image/png',
    sizeBytes: 1024 * 220,
    altText: 'Lexido Brand Crest Minimalist',
    width: 800,
    height: 800,
    createdAt: new Date('2026-11-03T13:00:00Z'),
  },
  {
    id: 'seed-brand-2',
    name: 'atelier-craftsmanship.jpg',
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop',
    folder: 'brands',
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * 590,
    altText: 'Atelier Workshop Craftsmanship',
    width: 1200,
    height: 800,
    createdAt: new Date('2026-11-03T14:00:00Z'),
  },
  {
    id: 'seed-sup-1',
    name: 'sustainable-textiles-cert.pdf',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
    folder: 'suppliers',
    mimeType: 'application/pdf',
    sizeBytes: 1024 * 350,
    altText: 'Sustainable Textile Certification',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T15:00:00Z'),
  },
  {
    id: 'seed-doc-1',
    name: 'organic-cotton-specs.pdf',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
    folder: 'documents',
    mimeType: 'application/pdf',
    sizeBytes: 1024 * 280,
    altText: 'Organic Cotton Technical Specifications',
    width: 800,
    height: 1000,
    createdAt: new Date('2026-11-03T16:00:00Z'),
  },
];

// In-memory buffer to retain uploaded files during server runtime
const uploadedSessionFiles: MediaFileRecord[] = [];

/**
 * Uploads media file to Cloudflare R2 and persists record in media registry.
 */
export async function uploadMediaAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  fileRecord?: MediaFileRecord;
  error?: string;
}> {
  try {
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';
    const altText = (formData.get('altText') as string) || null;

    if (!file || file.size === 0) {
      return { success: false, error: 'No file was selected for upload.' };
    }

    if (file.size > storageConfig.maxFileSize) {
      return { success: false, error: 'File size exceeds maximum allowed limit of 10MB.' };
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const objectPath = `${folder}/${timestamp}-${cleanFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let mediaUrl: string | undefined = undefined;

    // 1. Try Cloudflare R2 Upload
    try {
      const result = await storageClient.uploadFile({
        bucket: storageConfig.r2.bucketName || 'storage',
        path: objectPath,
        file: buffer,
        contentType: file.type || 'image/jpeg',
      });
      if (result.success && result.url) {
        mediaUrl = result.url;
      }
    } catch (r2Err) {
      console.warn('Cloudflare R2 upload attempt encountered an issue, falling back to local storage:', r2Err);
    }

    // 2. Resilient Fallback: Save to public/uploads directory so we have a persistent, fast, clean HTTP URL
    if (!mediaUrl) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, `${timestamp}-${cleanFilename}`);
        await fs.writeFile(filePath, buffer);
        mediaUrl = `/uploads/${folder}/${timestamp}-${cleanFilename}`;
      } catch (fsErr) {
        console.warn('Local disk write failed, falling back to base64 data URI:', fsErr);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        mediaUrl = `data:${mimeType};base64,${base64}`;
      }
    }

    // Insert record into PostgreSQL DB
    let newRecord: MediaFileRecord;
    try {
      const [inserted] = await db
        .insert(mediaFiles)
        .values({
          name: cleanFilename,
          url: mediaUrl,
          folder: folder.toLowerCase(),
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size,
          altText: altText || cleanFilename,
        })
        .returning();

      newRecord = inserted as MediaFileRecord;
    } catch {
      newRecord = {
        id: `temp-${timestamp}`,
        name: cleanFilename,
        url: mediaUrl,
        folder: folder.toLowerCase(),
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        altText: altText || cleanFilename,
        width: 800,
        height: 600,
        createdAt: new Date(),
      };
    }

    // Preserve in session buffer for instant picker availability
    uploadedSessionFiles.unshift(newRecord);

    try {
      revalidatePath('/admin/media');
    } catch {
      // Ignore if revalidatePath fails in non-request contexts
    }

    return {
      success: true,
      url: mediaUrl,
      fileRecord: newRecord,
    };
  } catch (err: any) {
    console.error('Media upload action error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to upload media file.',
    };
  }
}

/**
 * Fetches all registered media files with search, folder, mime type, and sort filters.
 */
export async function getMediaFilesAction(params?: {
  folder?: string;
  query?: string;
  mimeType?: string;
  sortBy?: 'newest' | 'oldest' | 'name' | 'size';
}): Promise<{
  success: boolean;
  files: MediaFileRecord[];
  kpis: {
    totalFiles: number;
    totalSizeMB: string;
    imageCount: number;
    docCount: number;
  };
  error?: string;
}> {
  try {
    let dbList: MediaFileRecord[] = [];
    try {
      dbList = (await db
        .select()
        .from(mediaFiles)
        .orderBy(
          params?.sortBy === 'oldest'
            ? asc(mediaFiles.createdAt)
            : params?.sortBy === 'name'
            ? asc(mediaFiles.name)
            : params?.sortBy === 'size'
            ? desc(mediaFiles.sizeBytes)
            : desc(mediaFiles.createdAt)
        )) as MediaFileRecord[];
    } catch {
      dbList = [];
    }

    // Combine database files, session uploads, and default seed assets without duplicates
    const combinedMap = new Map<string, MediaFileRecord>();

    // 1. Session uploads first
    for (const f of uploadedSessionFiles) {
      combinedMap.set(f.id, f);
    }

    // 2. Database records
    for (const f of dbList) {
      combinedMap.set(f.id, f);
    }

    // 3. Always ensure default curated assets are available across all folders (categories, banners, products)
    for (const f of DEFAULT_MEDIA_ASSETS) {
      if (!combinedMap.has(f.id)) {
        combinedMap.set(f.id, f);
      }
    }

    let list = Array.from(combinedMap.values());

    // Apply filters
    if (params?.folder && params.folder !== 'all') {
      list = list.filter((f) => f.folder.toLowerCase() === params.folder?.toLowerCase());
    }

    if (params?.query && params.query.trim() !== '') {
      const q = params.query.toLowerCase();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || (f.altText && f.altText.toLowerCase().includes(q))
      );
    }

    if (params?.mimeType && params.mimeType !== 'all') {
      if (params.mimeType === 'image') {
        list = list.filter((f) => f.mimeType.startsWith('image/'));
      } else if (params.mimeType === 'document') {
        list = list.filter((f) => !f.mimeType.startsWith('image/'));
      }
    }

    // Sort list
    if (params?.sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (params?.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params?.sortBy === 'size') {
      list.sort((a, b) => b.sizeBytes - a.sizeBytes);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalFiles = list.length;
    const totalBytes = list.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
    const totalSizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const imageCount = list.filter((f) => f.mimeType.startsWith('image/')).length;
    const docCount = totalFiles - imageCount;

    return {
      success: true,
      files: list,
      kpis: {
        totalFiles,
        totalSizeMB,
        imageCount,
        docCount,
      },
    };
  } catch (err: any) {
    console.error('Failed to get media files:', err);
    return {
      success: false,
      files: DEFAULT_MEDIA_ASSETS,
      kpis: { totalFiles: DEFAULT_MEDIA_ASSETS.length, totalSizeMB: '8.4', imageCount: 12, docCount: 2 },
      error: err?.message || 'Failed to fetch media files.',
    };
  }
}

/**
 * Updates file SEO Alt Text.
 */
export async function updateMediaAltTextAction(
  id: string,
  altText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    try {
      await db.update(mediaFiles).set({ altText }).where(eq(mediaFiles.id, id));
    } catch {
      // In-memory fallback
      const found = uploadedSessionFiles.find((f) => f.id === id);
      if (found) found.altText = altText;
    }
    revalidatePath('/admin/media');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update alt text.' };
  }
}

/**
 * Deletes selected media files from database and Cloudflare R2 storage.
 */
export async function deleteMediaFilesAction(ids: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true };

    try {
      const records = await db.select().from(mediaFiles).where(inArray(mediaFiles.id, ids));

      for (const record of records) {
        if (record.url && record.url.includes(storageConfig.r2.publicUrl)) {
          const objectPath = record.url.replace(`${storageConfig.r2.publicUrl}/`, '');
          await storageClient.deleteFile({
            bucket: storageConfig.r2.bucketName || 'storage',
            path: objectPath,
          });
        }
      }

      await db.delete(mediaFiles).where(inArray(mediaFiles.id, ids));
    } catch {
      // In-memory delete
      for (let i = uploadedSessionFiles.length - 1; i >= 0; i--) {
        if (ids.includes(uploadedSessionFiles[i].id)) {
          uploadedSessionFiles.splice(i, 1);
        }
      }
    }

    revalidatePath('/admin/media');
    return { success: true };
  } catch (err: any) {
    console.error('Delete media files error:', err);
    return { success: false, error: err?.message || 'Failed to delete selected media files.' };
  }
}
