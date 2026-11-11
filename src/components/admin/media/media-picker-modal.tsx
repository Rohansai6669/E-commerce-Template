'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getMediaFilesAction,
  uploadMediaAction,
  type MediaFileRecord,
} from '@/app/actions/media-actions';
import {
  X,
  Search,
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Loader2,
  Cloud,
  Check,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, fileRecord?: MediaFileRecord) => void;
  currentValue?: string;
  defaultFolder?: string;
  title?: string;
}

const FOLDERS = [
  { id: 'all', label: 'ALL FILES' },
  { id: 'products', label: 'PRODUCTS' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'banners', label: 'BANNERS' },
  { id: 'brands', label: 'BRANDS' },
  { id: 'suppliers', label: 'SUPPLIERS' },
  { id: 'documents', label: 'DOCUMENTS' },
];

/**
 * Dedicated Media Asset Selector Modal.
 * Uses React Portal to mount directly into document.body, ensuring it is NEVER
 * squashed or constrained by any parent drawer, slide-over sheet, or dialog container.
 */
export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  defaultFolder = 'all',
  title = 'Select Media Asset',
}: MediaPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<MediaFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<MediaFileRecord | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState(
    defaultFolder === 'all' ? 'products' : defaultFolder
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure client-side portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load files when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    getMediaFilesAction()
      .then((res) => {
        if (!isMounted) return;
        setFiles(res.files || []);
        // If currentValue matches any file, pre-select it
        if (currentValue) {
          const matched = res.files?.find((f) => f.url === currentValue);
          if (matched) setSelectedFile(matched);
        }
      })
      .catch((err) => {
        console.error('Failed to load media files:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentValue]);

  // Sync default folder when prop changes or modal opens
  useEffect(() => {
    if (isOpen && defaultFolder) {
      setActiveFolder(defaultFolder);
      if (defaultFolder !== 'all') {
        setUploadFolder(defaultFolder);
      }
    }
  }, [isOpen, defaultFolder]);

  // Handle direct file upload from device
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    const file = selectedFiles[0];
    const targetFolder = uploadFolder || (activeFolder !== 'all' ? activeFolder : 'products');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', targetFolder);

    const toastId = toast.loading(`Uploading "${file.name}"...`);

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.fileRecord) {
        setFiles((prev) => [res.fileRecord!, ...prev]);
        setSelectedFile(res.fileRecord);
        if (activeFolder !== 'all' && activeFolder !== targetFolder) {
          setActiveFolder(targetFolder);
        }
        toast.success(`"${file.name}" uploaded and selected!`, { id: toastId });
      } else {
        toast.error(res.error || 'Failed to upload media file.', { id: toastId });
      }
    } catch {
      toast.error('An error occurred while uploading file.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (activeFolder !== 'all' && f.folder.toLowerCase() !== activeFolder.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesAlt = f.altText ? f.altText.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesAlt) return false;
      }
      return true;
    });
  }, [files, activeFolder, searchQuery]);

  const handleConfirm = () => {
    if (!selectedFile) return;
    onSelect(selectedFile.url, selectedFile);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      ref={containerRef}
      data-media-picker-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Main Full-Size Modal Dialog Container */}
      <div
        className="relative w-full max-w-5xl xl:max-w-6xl h-[88vh] max-h-[850px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900 z-10 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 sm:px-8 py-5 shrink-0 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-950 text-white uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <Cloud className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> CLOUDFLARE R2
              </span>
              <h2
                id="media-picker-title"
                className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 uppercase font-heading"
              >
                {title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select existing photos from your Cloudflare storage or upload new assets directly from your device.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar: Upload from Device & Search */}
        <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-white">
          {/* Upload Button + Folder Target */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={handleDeviceUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer transition disabled:opacity-60 shrink-0 h-10"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Uploading to R2...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload from Device
                </>
              )}
            </button>

            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 h-10 rounded-xl outline-none cursor-pointer focus:border-slate-950"
            >
              <option value="products">Bucket: Products</option>
              <option value="categories">Bucket: Categories</option>
              <option value="banners">Bucket: Banners</option>
              <option value="brands">Bucket: Brands</option>
              <option value="suppliers">Bucket: Suppliers</option>
              <option value="documents">Bucket: Documents</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name or alt text..."
              className="w-full pl-9 pr-8 h-10 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-950 focus:outline-none font-medium placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Folder Bucket Tabs */}
        <div className="flex border-b border-slate-200 px-6 sm:px-8 gap-1.5 overflow-x-auto py-2.5 shrink-0 scrollbar-none bg-slate-50/30">
          {FOLDERS.map((folder) => {
            const isActive = activeFolder === folder.id;
            const count =
              folder.id === 'all'
                ? files.length
                : files.filter((f) => f.folder.toLowerCase() === folder.id).length;

            return (
              <button
                key={folder.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFolder(folder.id);
                  if (folder.id !== 'all') {
                    setUploadFolder(folder.id);
                  }
                }}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-slate-950 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <span>{folder.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Media Grid Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 min-h-[300px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
              <span className="text-xs font-bold uppercase tracking-wider">Loading Media Assets...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
              <ImageIcon className="w-8 h-8 text-slate-300" />
              <span className="text-sm font-bold text-slate-800">No media assets found</span>
              <p className="text-xs text-slate-500 max-w-sm">
                No files found in the &ldquo;{activeFolder.toUpperCase()}&rdquo; folder. You can browse all store media or upload a new photo directly to this folder.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {activeFolder !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveFolder('all')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer transition"
                  >
                    Browse All Files ({files.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (activeFolder !== 'all') setUploadFolder(activeFolder);
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-800 cursor-pointer shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Upload to this folder
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                const isImage = file.mimeType.startsWith('image/');

                return (
                  <div
                    key={file.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(file);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(file);
                      onSelect(file.url, file);
                      onClose();
                    }}
                    className={cn(
                      'group relative rounded-2xl border bg-white p-2 flex flex-col cursor-pointer transition select-none shadow-2xs hover:shadow-md',
                      isSelected
                        ? 'border-2 border-slate-950 ring-2 ring-slate-950/20 bg-slate-50/50'
                        : 'border-slate-200 hover:border-slate-400'
                    )}
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.altText || file.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <FileText className="w-8 h-8 text-slate-500" />
                          <span className="text-[10px] font-bold uppercase">{file.mimeType.split('/')[1] || 'DOC'}</span>
                        </div>
                      )}

                      {/* Selection Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-slate-950 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Folder Badge */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[9px] font-extrabold uppercase text-white tracking-wider">
                          {file.folder}
                        </span>
                      </div>
                    </div>

                    {/* Meta Details */}
                    <div className="pt-2 flex flex-col">
                      <span className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                        <span>{formatSize(file.sizeBytes)}</span>
                        {file.width && file.height && (
                          <span>{file.width}×{file.height}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Selected Item Info & Action Buttons */}
        <div className="border-t border-slate-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
            {selectedFile ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate text-xs">
                  <span className="font-bold text-slate-900 block truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready to Insert ({selectedFile.folder})
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No asset selected. Click a file to choose.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm();
              }}
              disabled={!selectedFile}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer transition"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              Use Selected Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default MediaPickerModal;
