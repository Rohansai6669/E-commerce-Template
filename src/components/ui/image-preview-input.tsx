'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  ImageOff,
  ExternalLink,
  X,
  CheckCircle2,
  Video,
  Loader2,
  RefreshCw,
  FolderOpen,
  UploadCloud,
  Link as LinkIcon,
  Cloud,
  Edit2,
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { MediaPickerModal } from '@/components/admin/media/media-picker-modal';
import { uploadMediaAction } from '@/app/actions/media-actions';
import { toast } from 'sonner';

export interface ImagePreviewInputProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'banner' | 'auto';
  disabled?: boolean;
  className?: string;
  allowVideo?: boolean;
  mediaType?: 'image' | 'video';
  onMediaTypeChange?: (type: 'image' | 'video') => void;
  folder?: string;
}

export function ImagePreviewInput({
  name,
  value,
  onChange,
  label,
  placeholder = 'https://images.unsplash.com/... or Cloudflare R2 URL',
  description,
  aspectRatio = 'video',
  disabled = false,
  className,
  allowVideo = false,
  mediaType = 'image',
  onMediaTypeChange,
  folder,
}: ImagePreviewInputProps) {
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testCounter, setTestCounter] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmedValue = (value || '').trim();
  const hasValue = trimmedValue.length > 0;

  const resolvedFolder =
    folder ||
    (aspectRatio === 'banner' || aspectRatio === 'wide' ? 'banners' : 'products');

  const isCloudflareAsset =
    trimmedValue.includes('.r2.dev') ||
    trimmedValue.includes('cloudflarestorage') ||
    trimmedValue.includes('/storage/');

  const isVideo =
    allowVideo &&
    (mediaType === 'video' ||
      trimmedValue.endsWith('.mp4') ||
      trimmedValue.endsWith('.webm') ||
      trimmedValue.includes('video'));

  useEffect(() => {
    if (!hasValue) {
      setLoadStatus('idle');
      return;
    }

    if (isVideo) {
      setLoadStatus('success');
      return;
    }

    setLoadStatus('loading');
    const img = new Image();
    img.src = trimmedValue;
    img.onload = () => {
      setLoadStatus('success');
    };
    img.onerror = () => {
      setLoadStatus('error');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [trimmedValue, isVideo, testCounter]);

  // Handle direct file upload from device
  const handleDeviceUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', resolvedFolder);

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success(`"${file.name}" uploaded to Cloudflare R2 and applied!`);
      } else {
        toast.error(res.error || 'Failed to upload image.');
      }
    } catch {
      toast.error('An error occurred during Cloudflare upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDeviceUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleDeviceUpload(file);
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[220px]'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9] max-h-48'
      : aspectRatio === 'wide'
      ? 'aspect-[16/7] max-h-52'
      : aspectRatio === 'video'
      ? 'aspect-video max-h-56'
      : 'max-h-60';

  return (
    <div className={cn('space-y-2.5 w-full select-none text-slate-900', className)}>
      {/* Form Submission Value */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Hidden Device File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/mp4"
        onChange={onFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Top Header & Actions Bar */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            {isVideo ? (
              <Video className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-slate-700" />
            )}
            <span>{label}</span>
          </label>

          {allowVideo && onMediaTypeChange && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
              <button
                type="button"
                onClick={() => onMediaTypeChange('image')}
                className={cn(
                  'px-2 py-0.5 font-bold uppercase rounded cursor-pointer transition',
                  mediaType === 'image'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => onMediaTypeChange('video')}
                className={cn(
                  'px-2 py-0.5 font-bold uppercase rounded cursor-pointer transition',
                  mediaType === 'video'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Video
              </button>
            </div>
          )}
        </div>
      )}

      {/* When Image IS Selected */}
      {hasValue ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3 shadow-xs">
          {/* Live Preview Aspect Box */}
          <div
            className={cn(
              'relative w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200/80 shadow-inner group',
              aspectClass
            )}
          >
            {isVideo ? (
              <video
                src={trimmedValue}
                controls
                playsInline
                muted
                className="w-full h-full object-cover"
                onError={() => setLoadStatus('error')}
                onLoadedData={() => setLoadStatus('success')}
              />
            ) : (
              <>
                {loadStatus === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/40 backdrop-blur-xs text-white z-10">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Verifying Media...
                    </span>
                  </div>
                )}

                {loadStatus === 'error' ? (
                  <div className="p-4 flex flex-col items-center justify-center text-center gap-1.5 text-rose-400">
                    <ImageOff className="w-7 h-7 text-rose-500" />
                    <span className="text-xs font-bold text-rose-600">
                      Failed to load image preview
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-xs">
                      Verify URL or select a Cloudflare R2 asset.
                    </span>
                  </div>
                ) : (
                  <img
                    src={trimmedValue}
                    alt="Current media asset"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </>
            )}

            {/* Asset Status Badge */}
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
              {isCloudflareAsset ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide border border-emerald-500/40 shadow">
                  <Cloud className="w-3 h-3 text-emerald-400 fill-emerald-400" /> Cloudflare R2
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm text-[10px] font-extrabold text-slate-200 uppercase tracking-wide border border-white/20 shadow">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live Asset
                </span>
              )}
            </div>

            {/* Top Right Quick Actions */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTestCounter((c) => c + 1)}
                title="Reload Media"
                className="p-1 rounded bg-slate-950/70 hover:bg-slate-950 text-white text-xs transition cursor-pointer"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loadStatus === 'loading' && 'animate-spin')} />
              </button>
              <a
                href={trimmedValue}
                target="_blank"
                rel="noopener noreferrer"
                title="Open full resolution in new tab"
                className="p-1 rounded bg-slate-950/70 hover:bg-slate-950 text-white text-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Action Toolbar Below Preview */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              {/* Pick from Media Library */}
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                disabled={disabled}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-900" />
                <span>Media Library</span>
              </button>

              {/* Upload from Device */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Device</span>
                  </>
                )}
              </button>

              {/* Toggle URL input */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                title={showUrlInput ? 'Hide URL' : 'Edit URL directly'}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clear Image */}
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          {/* Collapsible Direct URL input */}
          {showUrlInput && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Direct Media URL</label>
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-slate-950 focus:outline-none"
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Shopify-style Dropzone & Options */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed p-4 transition text-center flex flex-col items-center justify-center gap-3 bg-white',
            isDragging
              ? 'border-slate-950 bg-slate-50'
              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
          )}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-700">
              <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Uploading to Cloudflare R2...
              </span>
              <span className="text-[10px] text-slate-400">Generating CDN URL & saving to library</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-0.5">
                <ImageIcon className="w-5 h-5 text-slate-500" />
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Select photo or media asset
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Drop file here, upload from computer, or pick from Cloudflare library
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {/* Pick from Library Button */}
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pick from Storage</span>
                </button>

                {/* Upload from Device Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-slate-900 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload Device</span>
                </button>
              </div>

              {/* Paste URL Toggle */}
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer pt-1 flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" /> or paste direct URL
                </button>
              ) : (
                <div className="w-full pt-2 flex items-center gap-1.5 max-w-sm">
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-slate-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {description && <p className="text-[11px] text-slate-500 font-normal">{description}</p>}

      {/* Cloudflare Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(selectedUrl) => {
          onChange(selectedUrl);
        }}
        currentValue={value}
        defaultFolder={resolvedFolder}
        title={label ? `Select Media: ${label}` : 'Select Media Asset'}
      />
    </div>
  );
}

export default ImagePreviewInput;
