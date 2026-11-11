import * as React from 'react';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { createCategoryAction } from '@/app/actions/category-actions';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { CategoriesList } from '@/components/admin/categories-list';
import { AddCategoryForm } from '@/components/admin/catalog/categories/add-category-form';
import { Plus, FolderTree, GitBranch } from 'lucide-react';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { sql, eq, and, aliasedTable } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';

const parentCategories = aliasedTable(categories, 'parent_categories');

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
}

/**
 * Admin Category & Subcategory Manager.
 * Displays all active catalog categories and subcategories along with live product count badges.
 */
export default async function AdminCategoriesPage() {
  const list = await safeQuery<CategoryRow>(
    () =>
      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          imageUrl: categories.imageUrl,
          isActive: categories.isActive,
          parentId: categories.parentId,
          parentName: parentCategories.name,
          productCount: sql<number>`cast(count(${products.id}) as integer)`,
        })
        .from(categories)
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .leftJoin(
          products,
          and(eq(products.categoryId, categories.id), sql`${products.deletedAt} IS NULL`)
        )
        .where(sql`${categories.deletedAt} IS NULL`)
        .groupBy(categories.id, parentCategories.name)
        .orderBy(categories.name),
    'categories'
  );

  // Available parent options (categories that are top-level or existing categories)
  const availableParents = list.filter((c) => !c.parentId);

  return (
    <div className="flex flex-col gap-6">
      {/* Headings and creation trigger row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-slate-900" />
            Category & Subcategory Taxonomy
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Organize products into hierarchical categories and subcategories (e.g. Men &rarr; T-Shirts, Hoodies) for navigation, filter facets, and store organization.
          </Text>
        </div>

        {/* Left slide-over trigger wrapper */}
        <AdminFormSheet
          title="Add Category / Subcategory"
          description="Create a top-level parent category or nest a new subcategory underneath an existing category with media upload."
          trigger={
            <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
              <Plus className="h-4 w-4" /> Add Category / Subcategory
            </Button>
          }
        >
          <AddCategoryForm availableParents={availableParents} />
        </AdminFormSheet>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start mt-2">
        {/* Categories list */}
        <Card className="border-slate-200/80 bg-white shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-3.5 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Categories & Subcategories
              </h3>
              <span className="text-xs text-slate-400 font-normal">
                ({list.filter((c) => !c.parentId).length} categories · {list.filter((c) => !!c.parentId).length} subcategories)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <CategoriesList initialCategories={list} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
