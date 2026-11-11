import * as React from 'react';
import { db } from '@/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '@/lib/db/schema/catalog/navigation';
import { safeQuery } from '@/lib/db/safe-query';
import { connection } from 'next/server';
import { asc } from 'drizzle-orm';
import {
  Menu,
  Plus,
  Layers,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Edit2,
  FolderTree,
  Columns,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NavigationBannerImageField } from '@/components/admin/navigation/navigation-banner-image-field';
import {
  createNavigationMenuAction,
  createNavigationItemAction,
  updateNavigationItemAction,
  deleteNavigationItemAction,
  updateNavigationPromotionAction,
  deleteNavigationMenuAction,
} from '@/app/actions/navigation-actions';

export default async function AdminNavigationPage() {
  await connection();

  const [menus, items, promos] = await Promise.all([
    safeQuery(() => db.select().from(navigationMenus).orderBy(asc(navigationMenus.name)), 'navigation_menus'),
    safeQuery(() => db.select().from(navigationItems).orderBy(asc(navigationItems.sortOrder)), 'navigation_items'),
    safeQuery(() => db.select().from(navigationPromotions), 'navigation_promotions'),
  ]);

  return (
    <div className="flex flex-col gap-8 w-full text-slate-900 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight font-heading flex items-center gap-2.5">
            <Menu className="w-7 h-7 text-slate-900" />
            Navigation & Mega Menu Manager
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 max-w-2xl">
            Customize top department menus, main categories, 2-column subcategories, and category promotional hero cards. Changes appear live on the storefront mega menu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold uppercase flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Preview Storefront
          </Link>

          {/* Add Menu Sheet */}
          <AdminFormSheet
            title="Create New Navigation Menu"
            description="Add a new top-level department or section menu (e.g. Collections, Categories, Summer Drop)."
            trigger={
              <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-800 h-9 px-4 rounded flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New Menu
              </Button>
            }
          >
            <form
              action={async (formData) => {
                'use server';
                await createNavigationMenuAction(formData);
              }}
              className="flex flex-col gap-4 py-2"
            >
              <FormField label="Menu Name">
                <Input name="name" required placeholder="e.g. Collections Menu" className="h-10 text-sm" />
              </FormField>
              <FormField label="Slug (Unique Identifier)">
                <Input name="slug" placeholder="e.g. collections-main-menu" className="h-10 text-xs font-mono" />
              </FormField>
              <Button type="submit" className="w-full mt-2 font-bold uppercase text-xs h-10 bg-slate-950 text-white">
                Create Menu
              </Button>
            </form>
          </AdminFormSheet>
        </div>
      </div>

      {/* Menus List */}
      <div className="flex flex-col gap-10">
        {menus.map((menu) => {
          const menuItems = items.filter((i) => i.menuId === menu.id);
          const menuPromo = promos.find((p) => p.menuId === menu.id);
          const parentCategories = menuItems.filter((i) => !i.parentId);

          return (
            <div
              key={menu.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col"
            >
              {/* Menu Card Header */}
              <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black font-heading text-slate-950 uppercase">{menu.name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">slug: {menu.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Add Main Category Button */}
                  <AdminFormSheet
                    title={`Add Main Category to ${menu.name}`}
                    description="Create a top-level category row (e.g. STREETWEAR, GYM WEAR, OLD MONEY) with its promotional banner."
                    trigger={
                      <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-900 text-white hover:bg-slate-800 h-8 px-3 rounded flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add Category
                      </Button>
                    }
                  >
                    <form
                      action={async (formData) => {
                        'use server';
                        await createNavigationItemAction(formData);
                      }}
                      className="flex flex-col gap-4 py-2"
                    >
                      <input type="hidden" name="menuId" value={menu.id} />
                      <input type="hidden" name="parentId" value="" />
                      <FormField label="Category Label (Display Title)">
                        <Input name="label" required placeholder="e.g. STREETWEAR" className="h-10 text-sm font-bold uppercase" />
                      </FormField>
                      <FormField label="Target URL">
                        <Input name="url" required placeholder="e.g. /products?category=streetwear" className="h-10 text-xs font-mono" />
                      </FormField>
                      <NavigationBannerImageField
                        name="imageUrl"
                        label="Promotional Banner Image (Cloudflare R2 or URL)"
                      />
                      <FormField label="Sort Order">
                        <Input name="sortOrder" type="number" defaultValue={(parentCategories.length + 1).toString()} className="h-10 text-xs font-mono" />
                      </FormField>
                      <Button type="submit" className="w-full mt-2 font-bold uppercase text-xs h-10 bg-slate-950 text-white">
                        Create Category
                      </Button>
                    </form>
                  </AdminFormSheet>

                  {/* Add Subcategory Button */}
                  <AdminFormSheet
                    title={`Add Subcategory to ${menu.name}`}
                    description="Add a specific product subcategory link under an existing category, assigned to Column 1 or Column 2."
                    trigger={
                      <Button variant="outline" className="font-bold cursor-pointer text-xs uppercase h-8 px-3 rounded flex items-center gap-1.5">
                        <Columns className="h-3.5 w-3.5" /> Add Subcategory
                      </Button>
                    }
                  >
                    <form
                      action={async (formData) => {
                        'use server';
                        await createNavigationItemAction(formData);
                      }}
                      className="flex flex-col gap-4 py-2"
                    >
                      <input type="hidden" name="menuId" value={menu.id} />
                      <FormField label="Parent Category">
                        <select name="parentId" required className="w-full h-10 border border-slate-200 rounded px-3 text-xs bg-slate-50 font-bold uppercase">
                          {parentCategories.map((p) => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Subcategory Display Label">
                        <Input name="label" required placeholder="e.g. Oversized T-Shirts" className="h-10 text-sm" />
                      </FormField>
                      <FormField label="Target URL">
                        <Input name="url" required placeholder="e.g. /products?category=streetwear" className="h-10 text-xs font-mono" />
                      </FormField>
                      <FormField label="Column Assignment">
                        <select name="columnNumber" className="w-full h-10 border border-slate-200 rounded px-3 text-xs bg-slate-50">
                          <option value="1">Column 1 (Left column in subcategory grid)</option>
                          <option value="2">Column 2 (Right column in subcategory grid)</option>
                        </select>
                      </FormField>
                      <FormField label="Sort Order">
                        <Input name="sortOrder" type="number" defaultValue="1" className="h-10 text-xs font-mono" />
                      </FormField>
                      <Button type="submit" className="w-full mt-2 font-bold uppercase text-xs h-10 bg-slate-950 text-white">
                        Save Subcategory
                      </Button>
                    </form>
                  </AdminFormSheet>
                </div>
              </div>

              {/* Main Categories & Subcategories Tree */}
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Categories & Subcategories Hierarchy ({parentCategories.length} Categories)
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {parentCategories.map((parent) => {
                    const children = menuItems.filter((i) => i.parentId === parent.id);
                    const col1 = children.filter((c) => c.columnNumber === 1 || !c.columnNumber);
                    const col2 = children.filter((c) => c.columnNumber === 2);

                    return (
                      <div
                        key={parent.id}
                        className="border border-slate-200 rounded-lg p-5 bg-white shadow-2xs flex flex-col gap-4"
                      >
                        {/* Parent Category Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-4">
                            {parent.imageUrl ? (
                              <img
                                src={parent.imageUrl}
                                alt={parent.label}
                                className="w-16 h-16 object-cover rounded-md border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}

                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-black font-heading text-slate-950 uppercase tracking-tight">
                                  {parent.label}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                  {children.length} subcategories
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{parent.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Edit Category Sheet */}
                            <AdminFormSheet
                              title={`Edit Category - ${parent.label}`}
                              description="Update category name, target URL, and promotional editorial banner."
                              trigger={
                                <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-bold cursor-pointer">
                                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                              }
                            >
                              <form
                                action={async (formData) => {
                                  'use server';
                                  await updateNavigationItemAction(formData);
                                }}
                                className="flex flex-col gap-4 py-2"
                              >
                                <input type="hidden" name="itemId" value={parent.id} />
                                <FormField label="Category Label">
                                  <Input name="label" defaultValue={parent.label} required className="h-10 text-sm font-bold uppercase" />
                                </FormField>
                                <FormField label="Target URL">
                                  <Input name="url" defaultValue={parent.url || ''} required className="h-10 text-xs font-mono" />
                                </FormField>
                                <NavigationBannerImageField
                                  name="imageUrl"
                                  defaultValue={parent.imageUrl || ''}
                                  label="Promotional Banner Image (Cloudflare R2 or URL)"
                                />
                                <FormField label="Sort Order">
                                  <Input name="sortOrder" type="number" defaultValue={parent.sortOrder.toString()} className="h-10 text-xs font-mono" />
                                </FormField>
                                <Button type="submit" className="w-full mt-2 font-bold uppercase text-xs h-10 bg-slate-950 text-white">
                                  Save Changes
                                </Button>
                              </form>
                            </AdminFormSheet>

                            {/* Delete Category Form */}
                            <form
                              action={async () => {
                                'use server';
                                await deleteNavigationItemAction(parent.id);
                              }}
                            >
                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </form>
                          </div>
                        </div>

                        {/* Subcategories Partitioned into Column 1 & Column 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {/* Column 1 */}
                          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-md flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Column 1 ({col1.length} items)
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {col1.map((child) => (
                                <div
                                  key={child.id}
                                  className="flex items-center justify-between p-2 bg-white border border-slate-200/80 rounded text-xs"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">{child.label}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{child.url}</span>
                                  </div>
                                  <form
                                    action={async () => {
                                      'use server';
                                      await deleteNavigationItemAction(child.id);
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                                      title="Delete subcategory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                </div>
                              ))}
                              {col1.length === 0 && (
                                <span className="text-xs text-slate-400 italic py-1">No items in Column 1</span>
                              )}
                            </div>
                          </div>

                          {/* Column 2 */}
                          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-md flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Column 2 ({col2.length} items)
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {col2.map((child) => (
                                <div
                                  key={child.id}
                                  className="flex items-center justify-between p-2 bg-white border border-slate-200/80 rounded text-xs"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">{child.label}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{child.url}</span>
                                  </div>
                                  <form
                                    action={async () => {
                                      'use server';
                                      await deleteNavigationItemAction(child.id);
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                                      title="Delete subcategory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                </div>
                              ))}
                              {col2.length === 0 && (
                                <span className="text-xs text-slate-400 italic py-1">No items in Column 2</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {parentCategories.length === 0 && (
                    <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center flex flex-col items-center justify-center gap-2">
                      <FolderTree className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No categories added to this menu yet.</p>
                      <p className="text-xs text-slate-400">
                        Click &quot;Add Category&quot; above to create your first top-level category like STREETWEAR or GYM WEAR.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Promotional Hero Card Settings */}
              {menuPromo && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={menuPromo.imageUrl || ''}
                      alt={menuPromo.title}
                      className="w-20 h-16 object-cover rounded-md border border-slate-300 shadow-2xs"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Default Menu Promo Hero Card
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">{menuPromo.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{menuPromo.description}</p>
                    </div>
                  </div>

                  <AdminFormSheet
                    title="Edit Default Menu Promotional Card"
                    description="Configure fallback promotional editorial hero card displayed when a category does not have a custom banner."
                    trigger={
                      <Button variant="outline" className="text-xs font-bold uppercase cursor-pointer h-8 px-3">
                        Edit Promo Card
                      </Button>
                    }
                  >
                    <form
                      action={async (formData) => {
                        'use server';
                        await updateNavigationPromotionAction(formData);
                      }}
                      className="flex flex-col gap-4 py-2"
                    >
                      <input type="hidden" name="promoId" value={menuPromo.id} />
                      <FormField label="Card Title">
                        <Input name="title" defaultValue={menuPromo.title} required className="h-10 text-sm font-bold" />
                      </FormField>
                      <FormField label="Description">
                        <Input name="description" defaultValue={menuPromo.description || ''} className="h-10 text-xs" />
                      </FormField>
                      <NavigationBannerImageField
                        name="imageUrl"
                        defaultValue={menuPromo.imageUrl || ''}
                        label="Promotional Card Image (Cloudflare R2 or URL)"
                      />
                      <FormField label="Target URL">
                        <Input name="targetUrl" defaultValue={menuPromo.targetUrl || ''} className="h-10 text-xs font-mono" />
                      </FormField>
                      <FormField label="Action CTA Label">
                        <Input name="actionLabel" defaultValue={menuPromo.actionLabel || ''} className="h-10 text-xs uppercase font-bold" />
                      </FormField>
                      <Button type="submit" className="w-full mt-2 font-bold uppercase text-xs h-10 bg-slate-950 text-white">
                        Save Promotional Card
                      </Button>
                    </form>
                  </AdminFormSheet>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
