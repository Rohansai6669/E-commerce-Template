'use client';

import * as React from 'react';
import { createGlobalAttributeAction, updateGlobalAttributeAction } from '@/app/actions/attribute-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { toast } from 'sonner';
import { Trash2, Plus, Sliders } from 'lucide-react';

interface AttributeFormProps {
  attribute?: {
    id: string;
    name: string;
    displayType: string;
    values: {
      id?: string;
      value: string;
      colorHex?: string | null;
      imageUrl?: string | null;
      sortOrder: number;
    }[];
  } | null;
  onSuccess: () => void;
}

export function AttributeForm({ attribute, onSuccess }: AttributeFormProps) {
  const [name, setName] = React.useState(attribute?.name || '');
  const [displayType, setDisplayType] = React.useState(attribute?.displayType || 'text');
  const [values, setValues] = React.useState<
    { id?: string; value: string; colorHex: string; imageUrl: string; sortOrder: number }[]
  >(
    attribute?.values.map((v) => ({
      id: v.id,
      value: v.value,
      colorHex: v.colorHex || '',
      imageUrl: v.imageUrl || '',
      sortOrder: v.sortOrder,
    })) || []
  );

  const [isPending, startTransition] = React.useTransition();

  const handleAddValue = () => {
    setValues((prev) => [
      ...prev,
      { value: '', colorHex: '', imageUrl: '', sortOrder: prev.length },
    ]);
  };

  const handleRemoveValue = (index: number) => {
    setValues((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleValueChange = (index: number, field: string, val: string) => {
    setValues((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Attribute name is required.');
      return;
    }

    startTransition(async () => {
      const payloadValues = values.map((v, index) => ({
        id: v.id,
        value: v.value.trim(),
        colorHex: v.colorHex || null,
        imageUrl: v.imageUrl || null,
        sortOrder: index,
      })).filter(v => v.value !== '');

      if (attribute) {
        const res = await updateGlobalAttributeAction(attribute.id, name, displayType, payloadValues);
        if (res.success) {
          toast.success('Attribute updated successfully.');
          onSuccess();
        } else {
          toast.error(res.error || 'Failed to update attribute.');
        }
      } else {
        const res = await createGlobalAttributeAction(name, displayType, payloadValues);
        if (res.success) {
          toast.success('Attribute created successfully.');
          onSuccess();
        } else {
          toast.error(res.error || 'Failed to create attribute.');
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
      <FormField label="Attribute Name">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Size, Color, Storage"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
        />
      </FormField>

      <FormField label="Display Type">
        <select
          value={displayType}
          onChange={(e) => setDisplayType(e.target.value)}
          disabled={isPending}
          className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
        >
          <option value="text">Text (e.g. S, M, L)</option>
          <option value="color">Color Swatch (e.g. Hex Codes)</option>
          <option value="image">Image Swatch (e.g. Textures/Swatches URL)</option>
        </select>
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Attribute Values
          </span>
          <Button
            type="button"
            onClick={handleAddValue}
            variant="outline"
            className="h-8 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-1 px-3 py-1 bg-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Value
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
          {values.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-4 text-center">
              No values added yet. Mapped attributes require at least one value.
            </div>
          ) : (
            values.map((val, index) => (
              <div key={index} className="flex gap-2 items-center bg-slate-50/50 p-2 rounded border border-slate-100">
                <Input
                  type="text"
                  value={val.value}
                  onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g. Black)"
                  required
                  disabled={isPending}
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-9 text-xs font-medium flex-1"
                />

                {displayType === 'color' && (
                  <div className="flex items-center gap-1.5 w-28">
                    <input
                      type="color"
                      value={val.colorHex || '#000000'}
                      onChange={(e) => handleValueChange(index, 'colorHex', e.target.value)}
                      disabled={isPending}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={val.colorHex}
                      onChange={(e) => handleValueChange(index, 'colorHex', e.target.value)}
                      placeholder="#000000"
                      disabled={isPending}
                      className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-9 text-[10px] w-16 px-1.5 font-mono"
                    />
                  </div>
                )}

                {displayType === 'image' && (
                  <Input
                    type="url"
                    value={val.imageUrl}
                    onChange={(e) => handleValueChange(index, 'imageUrl', e.target.value)}
                    placeholder="Image Swatch URL"
                    disabled={isPending}
                    className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-9 text-[10px] w-40 font-mono"
                  />
                )}

                <Button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  variant="ghost"
                  className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs"
      >
        {isPending ? 'Saving...' : attribute ? 'Update Attribute' : 'Create Attribute'}
      </Button>
    </form>
  );
}
