'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  deleteProductAction,
  bulkUpdateProductStatusAction,
  bulkUpdateProductCategoryAction,
  quickUpdateProductCategoryAction,
} from '@/app/actions/product-actions';
import { Button } from '@/components/ui/button';
import { EditProductSheet } from '@/components/admin/catalog/products/edit-product-sheet';
import { DataTable, type ColumnDef, type FilterConfig } from '@/components/admin/data-table';
import { toast } from 'sonner';
import {
  Trash2,
  Plus,
  FolderTree,
  ChevronDown,
  Check,
  AlertCircle,
  Tag,
  ImageOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProductRowItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    sku: string | null;
    status: string;
    gender?: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  quantity: number;
  primaryImage: string | null;
}

interface SuppliersItem {
  id: string;
  name: string;
  status: string;
}

interface SuppliersMappedItem {
  id: string;
  productId: string;
  supplierId: string;
}

interface VariantItem {
  id: string;
  productId: string;
}

interface ProductsListProps {
  products: ProductRowItem[];
  activeSuppliers: SuppliersItem[];
  mappedLinks: SuppliersMappedItem[];
  allVariants?: VariantItem[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

/**
 * Resilient product thumbnail with automatic "No Image Found" fallback on missing or broken media.
 */
function AdminProductThumb({ src, alt }: { src?: string | null; alt: string }) {
  const [error, setError] = React.useState(false);

  if (!src || src.trim() === '' || error) {
    return (
      <div
        className="h-10 w-10 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 rounded-sm flex flex-col items-center justify-center select-none shrink-0"
        title="No image found"
      >
        <ImageOff className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-10 w-10 object-cover rounded-sm border border-slate-200 shrink-0 bg-slate-50"
    />
  );
}

/**
 * Interactive inline category selector for table rows.
 * Allows store admins to organize any product with 1 click without leaving the page.
 */
function InlineCategorySelector({
  productId,
  currentCategory,
  categories,
  onUpdate,
}: {
  productId: string;
  currentCategory: { id: string; name: string } | null;
  categories: { id: string; name: string; parentId?: string | null }[];
  onUpdate: (cat: { id: string; name: string } | null) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (catId: string | null) => {
    setIsOpen(false);
    startTransition(async () => {
      const selected = catId ? categories.find((c) => c.id === catId) || null : null;
      const res = await quickUpdateProductCategoryAction(productId, catId);
      if (res.success) {
        onUpdate(selected);
        toast.success(selected ? `Category set to "${selected.name}"` : 'Category cleared.');
      } else {
        toast.error(res.error || 'Failed to update category.');
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {currentCategory ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold uppercase transition-colors cursor-pointer group"
          title="Click to quickly reassign category"
        >
          <span className="truncate max-w-[130px]">{currentCategory.name}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase transition-colors cursor-pointer"
          title="Product needs category assignment - click to organize"
        >
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>+ Set Category</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-xl border border-slate-200 py-1.5 z-[1050] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Assign Category / Subcategory
          </div>
          {categories.map((cat) => {
            const isSelected = currentCategory?.id === cat.id;
            const isSubcategory = Boolean(cat.parentId);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                } ${isSubcategory ? 'pl-5 text-indigo-950 font-medium' : 'font-semibold'}`}
              >
                <span className="truncate">
                  {isSubcategory ? `↳ ${cat.name}` : cat.name}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
          {currentCategory && (
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                ✕ Clear Category
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Bulk category assignment modal for checked items.
 */
function BulkCategoryModal({
  keys,
  categories,
  disabled,
  onSuccess,
}: {
  keys: string[];
  categories: { id: string; name: string; parentId?: string | null }[];
  disabled?: boolean;
  onSuccess: (newCatId: string | null, newCatName: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedCatId, setSelectedCatId] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  const handleApply = () => {
    if (!selectedCatId) return;

    startTransition(async () => {
      const targetCatId = selectedCatId === '__clear__' ? null : selectedCatId;
      const res = await bulkUpdateProductCategoryAction(keys, targetCatId);
      if (res.success) {
        const catName = targetCatId ? categories.find((c) => c.id === targetCatId)?.name || '' : null;
        toast.success(
          targetCatId
            ? `Assigned ${res.count} products to "${catName}".`
            : `Cleared category for ${res.count} products.`
        );
        onSuccess(targetCatId, catName);
        setOpen(false);
      } else {
        toast.error(res.error || 'Failed to bulk assign category.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled || keys.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer flex items-center gap-1.5"
        >
          <FolderTree className="h-3.5 w-3.5" />
          Set Category ({keys.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            Organize Selected Products
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-3">
          <p className="text-xs text-slate-600">
            Assign <strong className="text-slate-900 font-bold">{keys.length} selected products</strong> to a catalog category at once.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Category / Subcategory
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded px-3 text-sm bg-slate-50 font-semibold text-slate-900 focus:border-slate-950 outline-none"
            >
              <option value="">Select Category / Subcategory...</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `  ↳ ${c.name} (Subcategory)` : `📁 ${c.name}`}
                </option>
              ))}
              <option value="__clear__" className="text-rose-600 font-bold">
                ✕ Remove / Clear Category
              </option>
            </select>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={!selectedCatId || isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase h-9 px-4 cursor-pointer"
          >
            {isPending ? 'Applying...' : `Assign to ${keys.length} Products`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsList({
  products,
  activeSuppliers,
  mappedLinks,
  allVariants,
  categories,
  brands,
}: ProductsListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [localCategories, setLocalCategories] = React.useState<
    Record<string, { id: string; name: string } | null>
  >({});

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to delete this product from the catalog?')) return;

    startTransition(async () => {
      const res = await deleteProductAction(productId);
      if (res.success) {
        toast.success('Product deleted successfully');
      } else {
        toast.error(res.error || 'Failed to delete product');
      }
    });
  };

  // KPI calculations
  const totalCount = products.length;
  const partnerCount = products.filter((row) => {
    const mapping = mappedLinks.find((link) => link.productId === row.product.id);
    return !!mapping;
  }).length;
  const lexidoCount = totalCount - partnerCount;

  // Enriched items with derived properties for table display
  const tableData = React.useMemo(() => {
    return products.map((row) => {
      const mapping = mappedLinks.find((link) => link.productId === row.product.id);
      const boutique = mapping ? activeSuppliers.find((s) => s.id === mapping.supplierId) : null;
      const isPartner = !!mapping;
      let stockStatus = 'in_stock';
      if (row.quantity <= 0) stockStatus = 'out_of_stock';
      else if (row.quantity <= 5) stockStatus = 'low_stock';

      const currentCat =
        localCategories[row.product.id] !== undefined
          ? localCategories[row.product.id]
          : row.category;

      return {
        ...row,
        isPartner,
        supplierId: mapping?.supplierId || '',
        supplierName: boutique?.name || '—',
        categoryId: currentCat ? currentCat.id : '__uncategorized__',
        categoryDisplay: currentCat,
        stockStatus,
      };
    });
  }, [products, mappedLinks, activeSuppliers, localCategories]);

  // Filter Configuration
  const filterConfigs: FilterConfig[] = React.useMemo(() => {
    return [
      {
        id: 'isPartner',
        label: 'Source',
        type: 'select',
        options: [
          { label: 'Lexido Sourced', value: 'false' },
          { label: 'Partner Sourced', value: 'true' },
        ],
      },
      {
        id: 'supplierId',
        label: 'Supplier',
        type: 'select',
        requiresMarketplace: true,
        options: activeSuppliers.map((s) => ({ label: s.name, value: s.id })),
      },
      {
        id: 'categoryId',
        label: 'Category',
        type: 'select',
        options: [
          { label: '⚠️ Uncategorized (Needs Assignment)', value: '__uncategorized__' },
          ...categories.map((c: any) => ({
            label: c.parentId ? `  ↳ ${c.name}` : `📁 ${c.name}`,
            value: c.id,
          })),
        ],
      },
      {
        id: 'stockStatus',
        label: 'Stock Status',
        type: 'select',
        options: [
          { label: 'In Stock (> 5)', value: 'in_stock' },
          { label: 'Low Stock (1–5)', value: 'low_stock' },
          { label: 'Out of Stock (0)', value: 'out_of_stock' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Draft', value: 'draft' },
          { label: 'Archived', value: 'archived' },
        ],
      },
    ];
  }, [activeSuppliers, categories]);

  // Column Definitions
  const columns: ColumnDef<(typeof tableData)[0]>[] = React.useMemo(
    () => [
      {
        header: 'Product Name & SKU',
        sortable: true,
        sortValue: (r) => r.product.name,
        cell: (row) => {
          return (
            <div className="flex items-center gap-3">
              <AdminProductThumb src={row.primaryImage} alt={row.product.name} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 uppercase leading-snug tracking-wide text-xs">
                  {row.product.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                  {row.product.sku || 'NO-SKU'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Category (Quick Organize)',
        sortable: true,
        sortValue: (r) => r.categoryDisplay?.name || '',
        cell: (row) => (
          <InlineCategorySelector
            productId={row.product.id}
            currentCategory={row.categoryDisplay}
            categories={categories}
            onUpdate={(newCat) => {
              setLocalCategories((prev) => ({ ...prev, [row.product.id]: newCat }));
            }}
          />
        ),
      },
      {
        header: 'Source',
        sortable: true,
        sortValue: (r) => (r.isPartner ? 'Partner' : 'Lexido'),
        cell: (row) =>
          row.isPartner ? (
            <span className="border border-slate-900 bg-white text-slate-950 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm select-none">
              Partner
            </span>
          ) : (
            <span className="bg-slate-950 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm select-none">
              Lexido
            </span>
          ),
      },
      {
        header: 'Supplier',
        requiresMarketplace: true,
        sortable: true,
        sortValue: (r) => r.supplierName,
        cell: (row) => (
          <span className="text-xs text-slate-600 font-semibold">{row.supplierName}</span>
        ),
      },
      {
        header: 'Stock',
        sortable: true,
        sortValue: (r) => r.quantity,
        cell: (row) => (
          <span className="text-xs font-bold text-slate-900">
            {row.quantity}{' '}
            <span className="text-[10px] text-slate-400 font-normal">units</span>
          </span>
        ),
      },
      {
        header: 'Price',
        sortable: true,
        sortValue: (r) => parseFloat(r.product.price),
        cell: (row) => (
          <span className="font-extrabold text-slate-900 text-xs">
            {parseFloat(row.product.price).toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <EditProductSheet
              productId={row.product.id}
              productName={row.product.name}
              categories={categories}
              brands={brands}
            />
            <Button
              type="button"
              onClick={() => handleDeleteProduct(row.product.id)}
              disabled={isPending}
              className="h-8 w-8 p-0 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded flex items-center justify-center cursor-pointer border-solid shrink-0"
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [categories, brands, isPending]
  );

  return (
    <div className="flex flex-col gap-5 text-slate-900 font-sans w-full">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Products
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            {totalCount}
          </span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Lexido Sourced
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            {lexidoCount}
          </span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Partner Sourced
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            {partnerCount}
          </span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Outlets
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            {activeSuppliers.length}
          </span>
        </div>
      </div>

      {/* Primary Actions Header */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
            Catalog Inventory Items ({products.length})
          </h3>
        </div>
        <Link href="/admin/products/new">
          <Button
            type="button"
            className="bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs uppercase px-4 h-9 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Standardized DataTable Engine */}
      <DataTable
        columns={columns}
        data={tableData}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search products by name or SKU..."
        searchableKeys={(item) => [item.product.name, item.product.sku || '']}
        getItemKey={(item) => item.product.id}
        bulkActions={(keys, selectedItems, clearSelection) => (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Categorize Action */}
            <BulkCategoryModal
              keys={keys}
              categories={categories}
              disabled={isPending}
              onSuccess={(newCatId, newCatName) => {
                setLocalCategories((prev) => {
                  const next = { ...prev };
                  for (const k of keys) {
                    next[k] = newCatId ? { id: newCatId, name: newCatName || '' } : null;
                  }
                  return next;
                });
                clearSelection();
              }}
            />

            <Button
              type="button"
              onClick={() => {
                startTransition(async () => {
                  const res = await bulkUpdateProductStatusAction(keys, 'active');
                  if (res.succeededCount > 0) {
                    toast.success(`Activated ${res.succeededCount} products.`);
                  }
                  if (res.failedCount > 0) {
                    toast.error(`Failed to activate ${res.failedCount} products.`);
                  }
                  clearSelection();
                });
              }}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              Activate ({keys.length})
            </Button>

            <Button
              type="button"
              onClick={() => {
                startTransition(async () => {
                  const res = await bulkUpdateProductStatusAction(keys, 'archived');
                  if (res.succeededCount > 0) {
                    toast.success(`Archived ${res.succeededCount} products.`);
                  }
                  if (res.failedCount > 0) {
                    toast.error(`Failed to archive ${res.failedCount} products.`);
                  }
                  clearSelection();
                });
              }}
              disabled={isPending}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              Archive ({keys.length})
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (
                  !confirm(`Are you sure you want to soft-delete ${keys.length} selected products?`)
                )
                  return;
                startTransition(async () => {
                  let count = 0;
                  for (const id of keys) {
                    const res = await deleteProductAction(id);
                    if (res.success) count++;
                  }
                  clearSelection();
                  toast.success(`Successfully soft-deleted ${count} products.`);
                });
              }}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete ({keys.length})
            </Button>
          </div>
        )}
      />
    </div>
  );
}

export default ProductsList;
