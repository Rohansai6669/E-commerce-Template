'use client';

import * as React from 'react';
import {
  UploadCloud,
  FolderOpen,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaPickerModal } from '@/components/admin/media/media-picker-modal';
import { uploadMediaAction } from '@/app/actions/media-actions';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';

export interface ProductGalleryManagerProps {
  primaryImage: string;
  onPrimaryImageChange: (url: string) => void;
  galleryImages: string[];
  onGalleryImagesChange: (urls: string[]) => void;
  folder?: string;
  disabled?: boolean;
}

/**
 * Amazon-style Multi-Image & Gallery Media Manager for Admin Product Forms.
 * Handles primary cover image + secondary gallery images with Cloudflare R2 integration,
 * device upload, reordering, and fallback placeholders.
 */
export function ProductGalleryManager({
  primaryImage,
  onPrimaryImageChange,
  galleryImages,
  onGalleryImagesChange,
  folder = 'products',
  disabled = false,
}: ProductGalleryManagerProps) {
  const [isPrimaryPickerOpen, setIsPrimaryPickerOpen] = React.useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [quickAddUrl, setQuickAddUrl] = React.useState('');
  const [isQuickAdding, setIsQuickAdding] = React.useState(false);

  const fileInputRefPrimary = React.useRef<HTMLInputElement>(null);
  const fileInputRefGallery = React.useRef<HTMLInputElement>(null);

  // Direct Device Upload Handler for Cloudflare R2
  const handleDeviceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'primary' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image exceeds 15MB limit.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading "${file.name}" to Cloudflare R2...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await uploadMediaAction(formData);
      const uploadedUrl = res.url || res.fileRecord?.url;
      if (res.success && uploadedUrl) {
        toast.success(`Uploaded successfully to Cloudflare R2!`, { id: toastId });
        if (target === 'primary') {
          onPrimaryImageChange(uploadedUrl);
        } else {
          onGalleryImagesChange([...galleryImages, uploadedUrl]);
        }
      } else {
        toast.error(res.error || 'Upload failed.', { id: toastId });
      }
    } catch {
      toast.error('Error uploading file.', { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Reordering helpers
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= galleryImages.length) return;
    const next = [...galleryImages];
    const temp = next[index];
    next[index] = next[newIdx];
    next[newIdx] = temp;
    onGalleryImagesChange(next);
  };

  // Promote gallery image to primary cover
  const handlePromoteToPrimary = (index: number) => {
    const targetUrl = galleryImages[index];
    const remainingGallery = galleryImages.filter((_, idx) => idx !== index);
    if (primaryImage && primaryImage.trim()) {
      remainingGallery.unshift(primaryImage.trim());
    }
    onPrimaryImageChange(targetUrl);
    onGalleryImagesChange(remainingGallery);
    toast.success('Image set as primary cover view!');
  };

  // Remove single gallery image
  const handleRemoveGallery = (index: number) => {
    onGalleryImagesChange(galleryImages.filter((_, idx) => idx !== index));
  };

  // Quick add via URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddUrl.trim()) return;
    onGalleryImagesChange([...galleryImages, quickAddUrl.trim()]);
    setQuickAddUrl('');
    setIsQuickAdding(false);
    toast.success('Gallery image added!');
  };

  return (
    <div className="flex flex-col gap-5 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-900/40">
      {/* SECTION 1: Primary Cover Image */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
              Primary Cover Image (Hero Display)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Required for catalog cards</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Cover Preview Tile */}
          <div className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs flex items-center justify-center">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt="Primary Product Cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <NoImageFallback compact message="No Cover" />
            )}
            {primaryImage && (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-white backdrop-blur-xs uppercase">
                Cover
              </span>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex-1 flex flex-col gap-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => setIsPrimaryPickerOpen(true)}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                Pick from Media Library
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => fileInputRefPrimary.current?.click()}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                )}
                Upload from Device
              </Button>

              {primaryImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onPrimaryImageChange('')}
                  className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <Input
              type="url"
              value={primaryImage}
              onChange={(e) => onPrimaryImageChange(e.target.value)}
              placeholder="Or paste Cloudflare R2 image URL: https://..."
              disabled={disabled}
              className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1" />

      {/* SECTION 2: Amazon-Style Gallery Images */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
              Additional Gallery Images (Amazon-Style PDP)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {galleryImages.length} {galleryImages.length === 1 ? 'image' : 'images'} added
          </span>
        </div>

        {/* Gallery Image Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {galleryImages.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Product Gallery ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Order index badge */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                #{idx + 1}
              </span>

              {/* Floating Action Controls on Hover */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Move earlier"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Move later"
                    disabled={idx === galleryImages.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make this the Primary Cover Image"
                    onClick={() => handlePromoteToPrimary(idx)}
                    className="h-6 w-6 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Remove image from gallery"
                    onClick={() => handleRemoveGallery(idx)}
                    className="h-6 w-6 rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Gallery Image Action Tile */}
          <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/60 dark:bg-slate-900/40 transition-colors p-3 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              + Add Gallery Image
            </span>

            <div className="flex flex-col gap-1.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => setIsGalleryPickerOpen(true)}
                className="h-7 text-[11px] font-semibold gap-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <FolderOpen className="w-3 h-3 text-indigo-600" />
                From Library
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => fileInputRefGallery.current?.click()}
                className="h-7 text-[11px] font-semibold gap-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <UploadCloud className="w-3 h-3 text-emerald-600" />
                From Device
              </Button>

              <button
                type="button"
                onClick={() => setIsQuickAdding(!isQuickAdding)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer pt-0.5"
              >
                {isQuickAdding ? 'Cancel URL' : 'Paste URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick URL Adder Drawer */}
        {isQuickAdding && (
          <form
            onSubmit={handleAddUrl}
            className="flex items-center gap-2 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 animate-in fade-in duration-150"
          >
            <Input
              type="url"
              value={quickAddUrl}
              onChange={(e) => setQuickAddUrl(e.target.value)}
              placeholder="Paste direct image URL (https://...)"
              className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={!quickAddUrl.trim()}
              className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shrink-0"
            >
              Add to Gallery
            </Button>
          </form>
        )}
      </div>

      {/* Hidden File Inputs for Device Upload */}
      <input
        ref={fileInputRefPrimary}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleDeviceUpload(e, 'primary')}
      />
      <input
        ref={fileInputRefGallery}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleDeviceUpload(e, 'gallery')}
      />

      {/* Cloudflare Media Picker Modal for Primary Image */}
      <MediaPickerModal
        isOpen={isPrimaryPickerOpen}
        onClose={() => setIsPrimaryPickerOpen(false)}
        currentValue={primaryImage}
        defaultFolder="products"
        title="Select Primary Cover Image"
        onSelect={(url) => {
          onPrimaryImageChange(url);
          setIsPrimaryPickerOpen(false);
          toast.success('Primary cover image selected!');
        }}
      />

      {/* Cloudflare Media Picker Modal for Gallery Image */}
      <MediaPickerModal
        isOpen={isGalleryPickerOpen}
        onClose={() => setIsGalleryPickerOpen(false)}
        defaultFolder="products"
        title="Add Image to Gallery"
        onSelect={(url) => {
          onGalleryImagesChange([...galleryImages, url]);
          setIsGalleryPickerOpen(false);
          toast.success('Added to gallery!');
        }}
      />
    </div>
  );
}

export default ProductGalleryManager;
