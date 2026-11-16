'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/app/actions/category-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { toast } from 'sonner';
import {
  Box,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Folder,
  FolderOpen,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/core/utils/cn';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  parentId?: string | null;
  parentName?: string | null;
  productCount?: number;
}

interface CategoriesListProps {
  initialCategories: CategoryItem[];
}

export function CategoriesList({ initialCategories }: CategoriesListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = React.useState<{
    id: string;
    name: string;
    tier: 'subcategory' | 'child';
  } | null>(null);
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [subImageUrl, setSubImageUrl] = React.useState('');

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditImageUrl(cat.imageUrl || '');
  };

  const openAddSubcategoryModal = (parent: CategoryItem) => {
    setAddingSubcategoryTo({ id: parent.id, name: parent.name, tier: 'subcategory' });
    setSubImageUrl('');
  };

  const openAddChildModal = (parentName: string, sub: CategoryItem) => {
    setAddingSubcategoryTo({ id: sub.id, name: `${parentName} > ${sub.name}`, tier: 'child' });
    setSubImageUrl('');
  };

  // Search & Filter state
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  // Track expanded parent category IDs
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  // Available parent choices for editing (all categories formatted with tier breadcrumbs)
  const availableParents = React.useMemo(() => {
    return initialCategories.map((c) => ({
      id: c.id,
      name: c.parentName ? `${c.parentName} > ${c.name}` : c.name,
      isTopLevel: !c.parentId,
    }));
  }, [initialCategories]);

  // Group into hierarchical 3-Tier Tree: Tier 1 (Categories) -> Tier 2 (Subcategories) -> Tier 3 (Child Categories)
  const { categoryTree, orphanSubcategories, totalParents, totalSubcategories, totalChildren } = React.useMemo(() => {
    const tier1Map = new Map<
      string,
      {
        parent: CategoryItem;
        subcategories: Map<string, { subcategory: CategoryItem; children: CategoryItem[] }>;
      }
    >();

    // 1. Identify Tier 1 categories (parentId is null)
    initialCategories.forEach((cat) => {
      if (!cat.parentId) {
        tier1Map.set(cat.id, { parent: cat, subcategories: new Map() });
      }
    });

    // 2. Identify Tier 2 subcategories (parentId belongs to a Tier 1 category)
    const tier2Map = new Map<string, { subcategory: CategoryItem; parentTier1Id: string }>();
    initialCategories.forEach((cat) => {
      if (cat.parentId && tier1Map.has(cat.parentId)) {
        const tier1 = tier1Map.get(cat.parentId)!;
        const subEntry = { subcategory: cat, children: [] as CategoryItem[] };
        tier1.subcategories.set(cat.id, subEntry);
        tier2Map.set(cat.id, { subcategory: cat, parentTier1Id: cat.parentId });
      }
    });

    // 3. Identify Tier 3 child categories (parentId belongs to a Tier 2 subcategory)
    const orphans: CategoryItem[] = [];
    let childCount = 0;

    initialCategories.forEach((cat) => {
      if (!cat.parentId) return;
      if (tier2Map.has(cat.id)) return;

      if (tier2Map.has(cat.parentId)) {
        const t2 = tier2Map.get(cat.parentId)!;
        const tier1 = tier1Map.get(t2.parentTier1Id);
        if (tier1) {
          const sub = tier1.subcategories.get(cat.parentId);
          if (sub) {
            sub.children.push(cat);
            childCount++;
            return;
          }
        }
      }

      orphans.push(cat);
    });

    const tree = Array.from(tier1Map.values())
      .map(({ parent, subcategories }) => ({
        parent,
        subcategories: Array.from(subcategories.values())
          .map(({ subcategory, children }) => ({
            subcategory,
            children: children.sort((a, b) => a.name.localeCompare(b.name)),
          }))
          .sort((a, b) => a.subcategory.name.localeCompare(b.subcategory.name)),
      }))
      .sort((a, b) => a.parent.name.localeCompare(b.parent.name));

    return {
      categoryTree: tree,
      orphanSubcategories: orphans,
      totalParents: tier1Map.size,
      totalSubcategories: tier2Map.size,
      totalChildren: childCount,
    };
  }, [initialCategories]);

  // Auto-expand parents when searching
  React.useEffect(() => {
    if (!search.trim()) return;
    const query = search.toLowerCase();
    const newExpanded = new Set<string>();

    categoryTree.forEach(({ parent, subcategories }) => {
      const parentMatches =
        parent.name.toLowerCase().includes(query) || parent.slug.toLowerCase().includes(query);
      const subMatches = subcategories.some(
        ({ subcategory, children }) =>
          subcategory.name.toLowerCase().includes(query) ||
          subcategory.slug.toLowerCase().includes(query) ||
          children.some(
            (ch) => ch.name.toLowerCase().includes(query) || ch.slug.toLowerCase().includes(query)
          )
      );

      if (parentMatches || subMatches) {
        newExpanded.add(parent.id);
      }
    });

    setExpandedIds(newExpanded);
  }, [search, categoryTree]);

  // Toggle individual parent dropdown
  const toggleExpand = (parentId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  // Expand All / Collapse All
  const handleToggleExpandAll = () => {
    if (expandedIds.size === categoryTree.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(categoryTree.map((item) => item.parent.id)));
    }
  };

  // Filtered Tree based on Search and Status
  const filteredTree = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return categoryTree.filter(({ parent, subcategories }) => {
      if (statusFilter === 'active' && !parent.isActive) {
        const hasActiveSub = subcategories.some(
          ({ subcategory, children }) =>
            subcategory.isActive || children.some((ch) => ch.isActive)
        );
        if (!hasActiveSub) return false;
      }
      if (statusFilter === 'inactive' && parent.isActive) {
        const hasInactiveSub = subcategories.some(
          ({ subcategory, children }) =>
            !subcategory.isActive || children.some((ch) => !ch.isActive)
        );
        if (!hasInactiveSub) return false;
      }

      if (!query) return true;

      const parentMatches =
        parent.name.toLowerCase().includes(query) || parent.slug.toLowerCase().includes(query);
      const subMatches = subcategories.some(
        ({ subcategory, children }) =>
          subcategory.name.toLowerCase().includes(query) ||
          subcategory.slug.toLowerCase().includes(query) ||
          children.some(
            (ch) => ch.name.toLowerCase().includes(query) || ch.slug.toLowerCase().includes(query)
          )
      );

      return parentMatches || subMatches;
    });
  }, [categoryTree, search, statusFilter]);

  // Handlers
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    const formData = new FormData(e.currentTarget);
    formData.set('imageUrl', editImageUrl);
    startTransition(async () => {
      const res = await updateCategoryAction(editingCategory.id, formData);
      if (res.success) {
        toast.success('Category updated successfully');
        setEditingCategory(null);
      } else {
        toast.error(res.error || 'Failed to update category');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success('Category deleted successfully');
        setDeletingId(null);
      } else {
        toast.error(res.error || 'Failed to delete category');
      }
    });
  };

  const handleCreateSubcategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingSubcategoryTo) return;

    const formData = new FormData(e.currentTarget);
    formData.set('parentId', addingSubcategoryTo.id);
    formData.set('imageUrl', subImageUrl);

    const isChild = addingSubcategoryTo.tier === 'child';
    startTransition(async () => {
      const res = await createCategoryAction(formData);
      if (res.success) {
        toast.success(
          `${isChild ? 'Child category' : 'Subcategory'} added under ${addingSubcategoryTo.name}!`
        );
        setExpandedIds((prev) => new Set(prev).add(addingSubcategoryTo.id));
        setAddingSubcategoryTo(null);
      } else {
        toast.error(res.error || `Failed to create ${isChild ? 'child category' : 'subcategory'}`);
      }
    });
  };

  const isAllExpanded = expandedIds.size > 0 && expandedIds.size >= filteredTree.length;

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Clean, uncluttered toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="pl-8 pr-7 h-8 text-xs bg-slate-50/80 border-slate-200 focus:bg-white focus:border-slate-950 font-normal rounded-md"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters and Expand Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleExpandAll}
            className="h-8 text-xs text-slate-600 hover:text-slate-900 gap-1.5 px-2.5 cursor-pointer font-medium"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
          </Button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 text-slate-700 outline-none cursor-pointer focus:border-slate-950"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Streamlined Clean Dropdown Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-2.5 px-5">Category</th>
              <th className="py-2.5 px-4 w-36">Products</th>
              <th className="py-2.5 px-4 w-28">Status</th>
              <th className="py-2.5 px-5 w-44 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTree.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <p className="text-xs font-medium">No matching categories found.</p>
                </td>
              </tr>
            ) : (
              filteredTree.map(({ parent, subcategories }) => {
                const isExpanded = expandedIds.has(parent.id);
                const hasSubs = subcategories.length > 0;

                return (
                  <React.Fragment key={parent.id}>
                    {/* TOP-LEVEL PARENT ROW */}
                    <tr
                      className={cn(
                        'group transition-colors',
                        isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/40 bg-white'
                      )}
                    >
                      {/* Integrated Chevron + Name + Slug */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          {hasSubs ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(parent.id)}
                              className="h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0"
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <ChevronRight
                                className={cn(
                                  'w-3.5 h-3.5 transition-transform duration-150',
                                  isExpanded && 'rotate-90 text-indigo-600'
                                )}
                              />
                            </button>
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            </div>
                          )}

                          {parent.imageUrl ? (
                            <img
                              src={parent.imageUrl}
                              alt=""
                              className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
                              <Folder
                                className={cn(
                                  'w-3.5 h-3.5 transition-colors',
                                  isExpanded ? 'text-indigo-600' : 'text-amber-500'
                                )}
                              />
                            </div>
                          )}

                          <div className="flex items-baseline gap-2">
                            <button
                              type="button"
                              onClick={() => hasSubs && toggleExpand(parent.id)}
                              className={cn(
                                'font-semibold text-slate-900 text-xs tracking-tight text-left',
                                hasSubs && 'cursor-pointer hover:text-indigo-600'
                              )}
                            >
                              {parent.name}
                            </button>

                            <span className="text-[11px] text-slate-400 font-mono">
                              /{parent.slug}
                            </span>
                          </div>

                          {/* Minimalist Subcategory Pill */}
                          {hasSubs && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(parent.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer transition-colors ml-1"
                            >
                              <span>{subcategories.length} sub</span>
                              <ChevronDown
                                className={cn(
                                  'w-2.5 h-2.5 transition-transform duration-150',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/products?categoryId=${parent.id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          <span>{parent.productCount || 0} products</span>
                        </Link>
                      </td>

                      {/* Minimal Status Dot */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              parent.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            )}
                          />
                          <span className="text-xs text-slate-600 font-medium">
                            {parent.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Clean Actions */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openAddSubcategoryModal(parent)}
                            className="h-7 px-2 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            title={`Add subcategory under ${parent.name}`}
                          >
                            <Plus className="w-3 h-3 mr-0.5" />
                            Sub
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(parent)}
                            className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingId(parent.id)}
                            className="h-7 px-2 text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* NESTED SUBCATEGORIES (TIER 2) & CHILD CATEGORIES (TIER 3) */}
                    {isExpanded && hasSubs && (
                      <>
                        {subcategories.map(({ subcategory: sub, children }) => (
                          <React.Fragment key={sub.id}>
                            {/* TIER 2: SUBCATEGORY ROW */}
                            <tr className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors border-t border-slate-100/60">
                              {/* Indented Name with Tree Branch */}
                              <td className="py-2.5 px-5 pl-12">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 font-mono text-xs">↳</span>
                                  {sub.imageUrl ? (
                                    <img
                                      src={sub.imageUrl}
                                      alt=""
                                      className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  )}
                                  <span className="font-semibold text-slate-800 text-xs">
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    /{parent.slug}/{sub.slug}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                    Tier 2
                                  </span>
                                  {children.length > 0 && (
                                    <span className="text-[10px] font-medium text-slate-500">
                                      ({children.length} child {children.length === 1 ? 'item' : 'items'})
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Products Count */}
                              <td className="py-2.5 px-4">
                                <Link
                                  href={`/admin/products?categoryId=${sub.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                  <Box className="w-3.5 h-3.5 text-slate-300" />
                                  <span>{sub.productCount || 0} products</span>
                                </Link>
                              </td>

                              {/* Status */}
                              <td className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      'w-1.5 h-1.5 rounded-full',
                                      sub.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                    )}
                                  />
                                  <span className="text-xs text-slate-500">
                                    {sub.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>

                              {/* Actions: Add Child, Edit, Delete */}
                              <td className="py-2.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openAddChildModal(parent.name, sub)}
                                    className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                                    title={`Add Child Category under ${parent.name} > ${sub.name}`}
                                  >
                                    <Plus className="w-3 h-3 mr-0.5" />
                                    Child
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditModal(sub)}
                                    className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeletingId(sub.id)}
                                    className="h-6 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>

                            {/* TIER 3: CHILD CATEGORIES UNDER SUBCATEGORY */}
                            {children.map((child) => (
                              <tr
                                key={child.id}
                                className="bg-slate-100/40 hover:bg-slate-100/80 transition-colors"
                              >
                                <td className="py-2 px-5 pl-20">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 font-mono text-[11px]">↳ ↳</span>
                                    {child.imageUrl ? (
                                      <img
                                        src={child.imageUrl}
                                        alt=""
                                        className="w-4 h-4 rounded object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    )}
                                    <span className="font-medium text-slate-700 text-xs">
                                      {child.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      /{parent.slug}/{sub.slug}/{child.slug}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                      Tier 3
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2 px-4">
                                  <Link
                                    href={`/admin/products?categoryId=${child.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                                  >
                                    <Box className="w-3.5 h-3.5 text-slate-300" />
                                    <span>{child.productCount || 0} products</span>
                                  </Link>
                                </td>

                                <td className="py-2 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={cn(
                                        'w-1.5 h-1.5 rounded-full',
                                        child.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                      )}
                                    />
                                    <span className="text-[11px] text-slate-500">
                                      {child.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditModal(child)}
                                      className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeletingId(child.id)}
                                      className="h-6 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}

                        {/* Direct "+ Add subcategory" subtle link */}
                        <tr className="bg-slate-50/20">
                          <td colSpan={4} className="py-2 px-5 pl-12">
                            <button
                              type="button"
                              onClick={() => openAddSubcategoryModal(parent)}
                              className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer py-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              Add subcategory under {parent.name}
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                );
              })
            )}

            {/* UNASSIGNED SUB-CATEGORIES (IF ANY) */}
            {orphanSubcategories.length > 0 && (
              <>
                <tr className="bg-amber-50/50">
                  <td colSpan={4} className="py-2 px-5 font-semibold text-xs text-amber-800">
                    Unassigned Subcategories ({orphanSubcategories.length})
                  </td>
                </tr>
                {orphanSubcategories.map((orphan) => (
                  <tr key={orphan.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-5 pl-10">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-mono text-xs">↳</span>
                        {orphan.imageUrl ? (
                          <img
                            src={orphan.imageUrl}
                            alt=""
                            className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0"
                          />
                        ) : null}
                        <span className="font-medium text-slate-800 text-xs">{orphan.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">/{orphan.slug}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">
                      {orphan.productCount || 0} products
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">
                      {orphan.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td className="py-2.5 px-5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(orphan)}
                        className="h-6 px-2 text-[11px] text-indigo-600"
                      >
                        Assign Parent
                      </Button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK ADD SUBCATEGORY / CHILD CATEGORY MODAL */}
      <Dialog
        open={!!addingSubcategoryTo}
        onOpenChange={(open) => !open && setAddingSubcategoryTo(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              {addingSubcategoryTo?.tier === 'child'
                ? `Add Child Category under "${addingSubcategoryTo?.name}" (Tier 3)`
                : `Add Subcategory under "${addingSubcategoryTo?.name}" (Tier 2)`}
            </DialogTitle>
          </DialogHeader>
          {addingSubcategoryTo && (
            <form onSubmit={handleCreateSubcategory} className="flex flex-col gap-4 py-2">
              <FormField
                label={
                  addingSubcategoryTo.tier === 'child'
                    ? 'Child Category Name (Tier 3)'
                    : 'Subcategory Name (Tier 2)'
                }
              >
                <Input
                  name="name"
                  type="text"
                  placeholder={
                    addingSubcategoryTo.tier === 'child'
                      ? 'e.g. Oversized T-Shirts, Cargo Pants, Hoodies'
                      : 'e.g. Streetwear, Gym Wear, Formal, Denim'
                  }
                  required
                  autoFocus
                  className="bg-slate-50 border-slate-200 text-slate-900 h-9 text-xs font-medium"
                />
              </FormField>

              <FormField label="Description (Optional)">
                <Input
                  name="description"
                  type="text"
                  placeholder="Brief description"
                  className="bg-slate-50 border-slate-200 text-slate-900 h-9 text-xs"
                />
              </FormField>

              <FormField label="Category Photo / Media">
                <ImagePreviewInput
                  name="imageUrl"
                  value={subImageUrl}
                  onChange={setSubImageUrl}
                  placeholder="https://... or upload photo"
                  aspectRatio="square"
                  folder="categories"
                  description="Preview, paste URL, upload, or pick from media storage"
                />
              </FormField>

              <DialogFooter className="mt-3 flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="text-xs h-8">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-slate-950 text-white hover:bg-slate-900 text-xs font-semibold h-8"
                >
                  {isPending
                    ? 'Adding...'
                    : addingSubcategoryTo.tier === 'child'
                    ? 'Add Child Category'
                    : 'Add Subcategory'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Edit Category / Subcategory / Child
            </DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 py-2">
              <FormField label="Parent Category Hierarchy">
                <select
                  name="parentId"
                  defaultValue={editingCategory.parentId || 'none'}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 h-9 text-xs font-medium text-slate-900 outline-none"
                >
                  <option value="none">📁 Top-Level Category (Tier 1: No Parent)</option>
                  <optgroup label="Nest under Category or Subcategory:">
                    {availableParents
                      .filter((p) => p.id !== editingCategory.id)
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          ↳ {parent.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </FormField>

              <FormField label="Name">
                <Input
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 h-9 text-xs font-medium"
                />
              </FormField>

              <FormField label="Description">
                <Input
                  name="description"
                  defaultValue={editingCategory.description || ''}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-9 text-xs"
                />
              </FormField>

              <FormField label="Category Photo / Media">
                <ImagePreviewInput
                  name="imageUrl"
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  placeholder="https://... or upload photo"
                  aspectRatio="square"
                  folder="categories"
                  description="Preview, paste URL, upload, or pick from media storage"
                />
              </FormField>

              <FormField label="Status">
                <select
                  name="isActive"
                  defaultValue={editingCategory.isActive ? 'true' : 'false'}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 h-9 text-xs font-medium"
                >
                  <option value="true">Active (Visible)</option>
                  <option value="false">Inactive (Hidden)</option>
                </select>
              </FormField>

              <DialogFooter className="mt-3 flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="text-xs h-8">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-slate-950 text-white hover:bg-slate-900 text-xs font-semibold h-8"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-rose-600">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to delete this category? Active products assigned to it must be reassigned first.
          </div>
          <DialogFooter className="mt-3 flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-xs h-8">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesList;
