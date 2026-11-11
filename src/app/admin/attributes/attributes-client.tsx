'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Plus, Sparkles } from 'lucide-react';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { AttributeList } from '@/components/admin/attributes/attribute-list';
import { AttributeForm } from '@/components/admin/attributes/attribute-form';

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

interface AttributesClientProps {
  initialAttributes: Attribute[];
}

export function AttributesClient({ initialAttributes }: AttributesClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Headings and creation trigger row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Attributes Manager
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Define global reusable attribute presets and swatch properties for variant generation.
          </Text>
        </div>

        {/* Left slide-over creation trigger */}
        <AdminFormSheet
          title="Add Attribute Preset"
          description="Define a new global reusable attribute and configure its options list."
          open={isOpen}
          onOpenChange={setIsOpen}
          trigger={
            <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
              <Plus className="h-4 w-4" /> Add Attribute
            </Button>
          }
        >
          <AttributeForm
            onSuccess={() => {
              setIsOpen(false);
              handleRefresh();
            }}
          />
        </AdminFormSheet>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start mt-2">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Reusable Options Matrix ({initialAttributes.length})
            </h3>
          </CardHeader>
          <CardContent className="p-6 bg-slate-50/20">
            <AttributeList attributes={initialAttributes} onRefresh={handleRefresh} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
