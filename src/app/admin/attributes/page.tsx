import * as React from 'react';
import { db } from '@/lib/db';
import { globalAttributes, globalAttributeValues } from '@/lib/db/schema/catalog/variants';
import { eq } from 'drizzle-orm';
import { AttributesClient } from './attributes-client';

export default async function AdminAttributesPage() {
  const dbAttributes = await db
    .select()
    .from(globalAttributes)
    .where(eq(globalAttributes.status, 'active'))
    .orderBy(globalAttributes.sortOrder);

  const attributes = await Promise.all(
    dbAttributes.map(async (attr) => {
      const values = await db
        .select()
        .from(globalAttributeValues)
        .where(eq(globalAttributeValues.attributeId, attr.id))
        .orderBy(globalAttributeValues.sortOrder);
      return {
        ...attr,
        values,
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <AttributesClient initialAttributes={attributes} />
    </div>
  );
}
