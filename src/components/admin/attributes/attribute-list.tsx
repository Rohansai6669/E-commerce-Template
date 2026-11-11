'use client';

import * as React from 'react';
import { archiveGlobalAttributeAction } from '@/app/actions/attribute-actions';
import { Button } from '@/components/ui/button';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { AttributeForm } from './attribute-form';
import { toast } from 'sonner';
import { Edit2, Archive, SlidersHorizontal } from 'lucide-react';

interface Attribute {
  id: string;
  name: string;
  displayType: string;
  values: {
    id: string;
    value: string;
    colorHex?: string | null;
    imageUrl?: string | null;
    sortOrder: number;
  }[];
}

interface AttributeListProps {
  attributes: Attribute[];
  onRefresh: () => void;
}

export function AttributeList({ attributes, onRefresh }: AttributeListProps) {
  const [selectedAttr, setSelectedAttr] = React.useState<Attribute | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleArchive = (id: string) => {
    if (!confirm('Are you sure you want to archive this attribute? Mapped product variant matrices will keep existing values, but this definition will be hidden from new selections.')) {
      return;
    }

    startTransition(async () => {
      const res = await archiveGlobalAttributeAction(id);
      if (res.success) {
        toast.success('Attribute archived successfully.');
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to archive attribute.');
      }
    });
  };

  const handleEdit = (attr: Attribute) => {
    setSelectedAttr(attr);
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {attributes.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Global Attributes</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Reusable attributes let you quickly configure product variants (e.g. Size, Color, Materials, Storage options) with swatch colors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {attr.name}
                      <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase">
                        {attr.displayType}
                      </span>
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEdit(attr)}
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center justify-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleArchive(attr.id)}
                      disabled={isPending}
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center justify-center"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {attr.values.map((val) => (
                    <div
                      key={val.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {attr.displayType === 'color' && val.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: val.colorHex }}
                        />
                      )}
                      {attr.displayType === 'image' && val.imageUrl && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${val.imageUrl})` }}
                        />
                      )}
                      <span>{val.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Attribute Sheet Slider */}
      <AdminFormSheet
        title="Edit Global Attribute"
        description="Modify attribute name, display types, and option values checklist."
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      >
        {selectedAttr && (
          <AttributeForm
            attribute={selectedAttr}
            onSuccess={() => {
              setIsEditOpen(false);
              onRefresh();
            }}
          />
        )}
      </AdminFormSheet>
    </div>
  );
}
