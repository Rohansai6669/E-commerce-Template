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
          description="Create a top-level parent category or nest a new subcategory underneath an existing category."
          trigger={
            <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
              <Plus className="h-4 w-4" /> Add Category / Subcategory
            </Button>
          }
        >
          <form
            action={async (formData) => {
              'use server';
              await createCategoryAction(formData);
            }}
            className="flex flex-col gap-5 py-2"
          >
            <FormField label="Classification Hierarchy (Parent or Subcategory)">
              <div className="relative">
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue="none"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-medium"
                >
                  <option value="none">📁 Top-Level Category (e.g. Men, Women, Kids, Accessories)</option>
                  <optgroup label="Or select Parent to create a Subcategory:">
                    {availableParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        ↳ Subcategory under: {parent.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leave as Top-Level for main departments, or pick a parent to create a subcategory like <em>T-Shirts</em> under <em>Men</em>.
              </p>
            </FormField>

            <FormField label="Category / Subcategory Name">
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Graphic T-Shirts, Hoodies, or Street Wear"
                required
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
              />
            </FormField>

            <FormField label="Description">
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Optional description of this collection or category"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
              />
            </FormField>

            <FormField label="Category / Subcategory Image URL">
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                placeholder="https://... image URL (optional)"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
              />
            </FormField>

            <Button type="submit" className="w-full mt-4 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Save Taxonomy Item
            </Button>
          </form>
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
