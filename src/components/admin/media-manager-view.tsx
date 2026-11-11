'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  getMediaFilesAction,
  uploadMediaAction,
  deleteMediaFilesAction,
  updateMediaAltTextAction,
  type MediaFileRecord,
} from '@/app/actions/media-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { toast } from 'sonner';
import {
  UploadCloud,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  HardDrive,
  FileImage,
  FileText,
  Cloud,
  X,
  Edit2,
  Check,
  Loader2,
  FolderOpen,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface MediaManagerViewProps {
  initialFiles: MediaFileRecord[];
  initialKpis: {
    totalFiles: number;
    totalSizeMB: string;
    imageCount: number;
    docCount: number;
  };
}

export function MediaManagerView({ initialFiles, initialKpis }: MediaManagerViewProps) {
  const router = useRouter();
  const [files, setFiles] = React.useState<MediaFileRecord[]>(initialFiles);
  const [kpis, setKpis] = React.useState(initialKpis);
  const [isPending, startTransition] = React.useTransition();

  // Filters & State
  const [activeFolder, setActiveFolder] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [mimeFilter, setMimeFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Selection & Inspector state
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [inspectFile, setInspectFile] = React.useState<MediaFileRecord | null>(null);
  const [altTextEdit, setAltTextEdit] = React.useState<string>('');

  // Upload dropzone state
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState('products');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFiles(initialFiles);
    setKpis(initialKpis);
  }, [initialFiles, initialKpis]);

  // Press Escape to close inspector
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectFile) {
        setInspectFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectFile]);

  // Handle client file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    let count = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);

      const res = await uploadMediaAction(formData);
      if (res.success && res.fileRecord) {
        count++;
        setFiles((prev) => [res.fileRecord!, ...prev]);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success(`Successfully uploaded ${count} media asset(s) to Cloudflare R2!`);
    router.refresh();
  };

  // Filtered files view computation
  const filteredFiles = React.useMemo(() => {
    return files
      .filter((f) => {
        if (activeFolder !== 'all' && f.folder.toLowerCase() !== activeFolder.toLowerCase()) return false;
        if (mimeFilter === 'image' && !f.mimeType.startsWith('image/')) return false;
        if (mimeFilter === 'document' && f.mimeType.startsWith('image/')) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesName = f.name.toLowerCase().includes(q);
          const matchesAlt = f.altText ? f.altText.toLowerCase().includes(q) : false;
          if (!matchesName && !matchesAlt) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [files, activeFolder, mimeFilter, searchQuery, sortBy]);

  const isAllSelected = filteredFiles.length > 0 && filteredFiles.every((f) => selectedIds.has(f.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const handleSelectFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} media assets from Cloudflare R2?`)) return;

    startTransition(async () => {
      const targetIds = Array.from(selectedIds);
      const res = await deleteMediaFilesAction(targetIds);
      if (res.success) {
        setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
        setSelectedIds(new Set());
        if (inspectFile && selectedIds.has(inspectFile.id)) setInspectFile(null);
        toast.success(`Deleted ${targetIds.length} media assets.`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete media files.');
      }
    });
  };

  const handleBulkCopyUrls = () => {
    const urls = filteredFiles
      .filter((f) => selectedIds.has(f.id))
      .map((f) => f.url)
      .join('\n');
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${selectedIds.size} CDN media URLs to clipboard.`);
  };

  const handleSaveAltText = () => {
    if (!inspectFile) return;
    startTransition(async () => {
      const res = await updateMediaAltTextAction(inspectFile.id, altTextEdit);
      if (res.success) {
        setFiles((prev) =>
          prev.map((f) => (f.id === inspectFile.id ? { ...f, altText: altTextEdit } : f))
        );
        setInspectFile((prev) => (prev ? { ...prev, altText: altTextEdit } : null));
        toast.success('Alt text updated for SEO compliance.');
      } else {
        toast.error(res.error || 'Failed to update alt text.');
      }
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentKpis = React.useMemo(() => {
    const totalFiles = files.length;
    const totalBytes = files.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
    const totalSizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const imageCount = files.filter((f) => f.mimeType.startsWith('image/')).length;
    const docCount = totalFiles - imageCount;
    return { totalFiles, totalSizeMB, imageCount, docCount };
  }, [files]);

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 font-sans pb-16">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Media Files</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{currentKpis.totalFiles}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{currentKpis.totalSizeMB} MB</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Images</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{currentKpis.imageCount}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudflare R2 Status</span>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
            <Cloud className="w-4 h-4 fill-emerald-100" /> Active CDN Edge
          </span>
        </div>
      </div>

      {/* Shopify-style Dropzone Upload Toolbar */}
      <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 bg-slate-900 text-white rounded flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Upload Files to Cloudflare R2
            </span>
            <span className="text-[11px] text-slate-450 font-medium">
              Drag & drop media assets or choose destination bucket folder.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold px-3 h-9 rounded outline-none cursor-pointer"
          >
            <option value="products">Bucket: Products</option>
            <option value="brands">Bucket: Brands</option>
            <option value="suppliers">Bucket: Suppliers</option>
            <option value="banners">Bucket: Banners</option>
            <option value="documents">Bucket: Documents</option>
            <option value="general">Bucket: General</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold uppercase px-4 h-9 cursor-pointer flex items-center gap-2 shrink-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to R2...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" /> Upload Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Folder Category Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0.5 select-none">
        {[
          { id: 'all', label: 'All Files' },
          { id: 'products', label: 'Products' },
          { id: 'brands', label: 'Brands' },
          { id: 'suppliers', label: 'Suppliers' },
          { id: 'banners', label: 'Banners' },
          { id: 'documents', label: 'Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFolder(tab.id)}
            className={cn(
              'px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap',
              activeFolder === tab.id
                ? 'border-slate-950 text-slate-950 bg-slate-50/60'
                : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Control & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-3 rounded border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name or alt text..."
            className="w-full bg-white border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-950 outline-none h-9 font-sans"
            suppressHydrationWarning
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mime Filter */}
          <select
            value={mimeFilter}
            onChange={(e) => setMimeFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-xs font-semibold px-3 h-9 rounded outline-none cursor-pointer"
            suppressHydrationWarning
          >
            <option value="all">All File Types</option>
            <option value="image">Images Only</option>
            <option value="document">Documents Only</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-900 text-xs font-semibold px-3 h-9 rounded outline-none cursor-pointer"
            suppressHydrationWarning
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">File Name (A-Z)</option>
            <option value="size">File Size (Large-Small)</option>
          </select>

          {/* Grid/List View Switcher */}
          <div className="flex items-center border border-slate-200 rounded bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition cursor-pointer',
                viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-900'
              )}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition cursor-pointer',
                viewMode === 'list' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-900'
              )}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Select Floating Bulk Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs shadow-md border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 font-semibold">
            <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded text-[11px]">
              {selectedIds.size} selected
            </span>
            <span className="text-slate-300">
              {selectedIds.size} of {filteredFiles.length} items chosen
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleBulkCopyUrls}
              className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy CDN Links ({selectedIds.size})
            </Button>
            <Button
              type="button"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Selected ({selectedIds.size})
            </Button>
            <Button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main Files Display Grid / List */}
      {filteredFiles.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center gap-2">
          <FileImage className="w-8 h-8 text-slate-300" />
          <span>No media files found matching your search filters.</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.has(file.id);
            const isImage = file.mimeType.startsWith('image/');

            return (
              <div
                key={file.id}
                onClick={() => {
                  setInspectFile(file);
                  setAltTextEdit(file.altText || '');
                }}
                className={cn(
                  'group border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col transition cursor-pointer relative select-none hover:shadow-md hover:border-slate-400',
                  isSelected && 'ring-2 ring-slate-950 border-slate-950 bg-slate-50'
                )}
              >
                {/* Checkbox badge overlay */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => handleSelectFile(file.id, e)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950"
                    suppressHydrationWarning
                  />
                </div>

                {/* Media Preview Box */}
                <div className="h-36 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.altText || file.name}
                      className="h-full w-full object-cover transition transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-400" />
                  )}

                  {/* Folder Tag Badge */}
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {file.folder}
                  </span>
                </div>

                {/* Info Footer */}
                <div className="p-3 flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                    {file.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono">
                    <span>{formatSize(file.sizeBytes)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected;
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950"
                suppressHydrationWarning
              />
              <span>File Details & Name</span>
            </div>
            <div className="w-28 text-center">Bucket Folder</div>
            <div className="w-24 text-right">File Size</div>
            <div className="w-32 text-right">Date Uploaded</div>
            <div className="w-20 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFiles.map((file) => {
              const isSelected = selectedIds.has(file.id);
              const isImage = file.mimeType.startsWith('image/');

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    setInspectFile(file);
                    setAltTextEdit(file.altText || '');
                  }}
                  className={cn(
                    'py-3 px-4 flex items-center justify-between gap-4 transition cursor-pointer hover:bg-slate-50/80',
                    isSelected && 'bg-slate-100/60 font-medium'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => handleSelectFile(file.id, e)}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950 shrink-0"
                      suppressHydrationWarning
                    />
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-9 w-9 object-cover rounded border border-slate-200 bg-slate-50 shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 bg-slate-100 rounded flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">{file.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">{file.url}</span>
                    </div>
                  </div>

                  <div className="w-28 shrink-0 text-center">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {file.folder}
                    </span>
                  </div>

                  <div className="w-24 shrink-0 text-right text-xs font-mono text-slate-500">
                    {formatSize(file.sizeBytes)}
                  </div>

                  <div className="w-32 shrink-0 text-right text-xs font-mono text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  <div className="w-20 shrink-0 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(file.url);
                        toast.success('CDN Link copied to clipboard.');
                      }}
                      className="h-7 w-7 text-slate-400 hover:text-slate-900 cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shopify-style File Detail Inspector Drawer */}
      {inspectFile && (
        <>
          {/* Backdrop Overlay - Click outside to close */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1015] animate-in fade-in duration-150 cursor-pointer"
            onClick={() => setInspectFile(null)}
            aria-label="Click to close media inspector"
          />

          <div className="fixed inset-y-0 right-0 z-[1020] w-[95vw] sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Header with High-Visibility Close Button */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10 shrink-0">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileImage className="w-4 h-4 text-slate-700" /> Media Inspector
              </span>
              <button
                type="button"
                onClick={() => setInspectFile(null)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                title="Close Inspector (Esc)"
              >
                <span>Close</span>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* File Preview */}
            <div className="w-full h-56 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden">
              {inspectFile.mimeType.startsWith('image/') ? (
                <img
                  src={inspectFile.url}
                  alt={inspectFile.altText || inspectFile.name}
                  className="max-h-full max-w-full object-contain rounded"
                />
              ) : (
                <FileText className="w-16 h-16 text-slate-400" />
              )}
            </div>

            {/* File CDN URL Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cloudflare R2 CDN URL
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={inspectFile.url}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono h-9 truncate"
                  suppressHydrationWarning
                />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inspectFile.url);
                    toast.success('Media CDN URL copied!');
                  }}
                  className="bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold h-9 px-3 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>
            </div>

            {/* SEO Alt Text Form */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SEO Alt Text
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={altTextEdit}
                  onChange={(e) => setAltTextEdit(e.target.value)}
                  placeholder="Alt text describing image..."
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs h-9"
                  suppressHydrationWarning
                />
                <Button
                  type="button"
                  onClick={handleSaveAltText}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3 shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col gap-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-medium">File Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{inspectFile.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-medium">Bucket Folder:</span>
                <span className="font-bold text-slate-900 uppercase">{inspectFile.folder}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-medium">File Size:</span>
                <span className="font-mono text-slate-900 font-semibold">{formatSize(inspectFile.sizeBytes)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-medium">Content Type:</span>
                <span className="font-mono text-slate-900 font-semibold">{inspectFile.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date Uploaded:</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {new Date(inspectFile.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <a
              href={inspectFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-200 rounded py-2 transition bg-white"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Media in New Tab
            </a>

            {/* Actions: Close & Delete */}
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInspectFile(null)}
                className="flex-1 h-10 text-xs font-extrabold uppercase border-slate-300 hover:bg-slate-100 text-slate-800 cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5 mr-1 text-slate-500" /> Close
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (!confirm(`Are you sure you want to permanently delete "${inspectFile.name}" from Cloudflare R2?`)) return;
                  startTransition(async () => {
                    const res = await deleteMediaFilesAction([inspectFile.id]);
                    if (res.success) {
                      setFiles((prev) => prev.filter((f) => f.id !== inspectFile.id));
                      setInspectFile(null);
                      toast.success('Media asset deleted from Cloudflare R2.');
                      router.refresh();
                    }
                  });
                }}
                disabled={isPending}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold h-10 uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </>
    )}
    </div>
  );
}
export default MediaManagerView;
