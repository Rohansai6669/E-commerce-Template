'use client';

import * as React from 'react';
import { uploadMediaAction } from '@/app/actions/media-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { toast } from 'sonner';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle2, Loader2, Copy, ExternalLink, ImageOff, FolderOpen } from 'lucide-react';
import { MediaPickerModal } from '@/components/admin/media/media-picker-modal';
import { cn } from '@/core/utils/cn';

export interface MediaUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

export function MediaUploader({
  label = 'Media / Reference Image',
  value = '',
  onChange,
  folder = 'products',
  placeholder = 'https://...',
  helpText = 'Upload an image to Cloudflare R2 or paste a direct image URL.',
  className,
}: MediaUploaderProps) {
  const [activeTab, setActiveTab] = React.useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = React.useState(false);
  const [hasImgError, setHasImgError] = React.useState(false);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setHasImgError(false);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success('Media uploaded to Cloudflare R2 successfully!');
      } else {
        toast.error(res.error || 'Failed to upload media file.');
      }
    } catch {
      toast.error('An error occurred while uploading media.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success('Media URL copied to clipboard.');
  };

  const hasValue = !!value && value.trim() !== '';

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">{label}</label>}

      <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 flex flex-col gap-3">
        {/* Toggle Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded transition cursor-pointer',
              activeTab === 'upload' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Cloudflare R2 Upload
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded transition cursor-pointer',
              activeTab === 'url' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Media URL Input
          </button>

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded transition cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 ml-auto"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-900" /> Pick from Storage
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed border-slate-300 hover:border-slate-950 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-white text-center select-none',
                isUploading && 'opacity-60 pointer-events-none'
              )}
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Uploading media to Cloudflare R2...
                </div>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-slate-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">Click to upload or drag image here</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP or GIF up to 10MB</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* URL Mode */}
        {activeTab === 'url' && (
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-white border-slate-200 text-slate-900 h-9 text-xs font-mono"
            suppressHydrationWarning
          />
        )}

        {/* Preview Card */}
        {hasValue && (
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 mt-1 shadow-2xs">
            <div className="flex items-center gap-3 overflow-hidden">
              {hasImgError ? (
                <div className="h-14 w-14 rounded-lg border border-rose-200 bg-rose-50 flex flex-col items-center justify-center shrink-0 text-rose-500">
                  <ImageOff className="w-5 h-5" />
                  <span className="text-[8px] font-bold mt-0.5">Broken</span>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Media preview"
                  className="h-14 w-14 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                  onError={() => setHasImgError(true)}
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Media Asset Active
                </span>
                <span className="text-xs font-mono text-slate-800 truncate max-w-[260px] font-medium">{value}</span>
                <span className="text-[10px] text-slate-400">Live preview verified</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopyUrl}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer rounded-lg"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange('')}
                className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer rounded-lg"
                title="Remove Media"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {helpText && <span className="text-[10px] text-slate-400 font-sans">{helpText}</span>}
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          toast.success('Media asset selected from Cloudflare storage!');
        }}
        currentValue={value}
        defaultFolder={folder}
        title={label ? `Select Media: ${label}` : 'Select Media Asset'}
      />
    </div>
  );
}
export default MediaUploader;
