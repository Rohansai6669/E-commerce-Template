import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { globalAttributes, globalAttributeValues } from '../src/lib/db/schema/catalog/variants';
import { eq } from 'drizzle-orm';

async function seedUniversalAttributes() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log('Seeding / verifying universal attributes in database...');

  const attributesToEnsure = [
    {
      name: 'Festival',
      displayType: 'text',
      sortOrder: 1,
      values: [
        { value: 'Diwali', sortOrder: 1 },
        { value: 'Christmas', sortOrder: 2 },
        { value: 'Eid', sortOrder: 3 },
        { value: 'New Year', sortOrder: 4 },
        { value: 'Festive Luxe', sortOrder: 5 },
        { value: 'Holiday Special', sortOrder: 6 },
      ],
    },
    {
      name: 'Edition',
      displayType: 'text',
      sortOrder: 2,
      values: [
        { value: 'Limited Edition', sortOrder: 1 },
        { value: 'Collector Edition', sortOrder: 2 },
        { value: 'Exclusive Drop', sortOrder: 3 },
        { value: 'Standard Edition', sortOrder: 4 },
      ],
    },
    {
      name: 'Offer Tag',
      displayType: 'text',
      sortOrder: 3,
      values: [
        { value: 'Special Offer', sortOrder: 1 },
        { value: 'Festive Deal', sortOrder: 2 },
        { value: 'Clearance', sortOrder: 3 },
        { value: 'Bundle Deal', sortOrder: 4 },
        { value: 'Flash Sale', sortOrder: 5 },
      ],
    },
    {
      name: 'Material',
      displayType: 'text',
      sortOrder: 4,
      values: [
        { value: 'Cotton', sortOrder: 1 },
        { value: 'Silk', sortOrder: 2 },
        { value: 'Leather', sortOrder: 3 },
        { value: 'Titanium', sortOrder: 4 },
        { value: 'Aluminium', sortOrder: 5 },
        { value: 'Ceramic', sortOrder: 6 },
        { value: 'Wood', sortOrder: 7 },
      ],
    },
    {
      name: 'Color',
      displayType: 'color',
      sortOrder: 5,
      values: [
        { value: 'Black', colorHex: '#000000', sortOrder: 1 },
        { value: 'White', colorHex: '#FFFFFF', sortOrder: 2 },
        { value: 'Gold', colorHex: '#D4AF37', sortOrder: 3 },
        { value: 'Silver', colorHex: '#C0C0C0', sortOrder: 4 },
        { value: 'Red', colorHex: '#EF4444', sortOrder: 5 },
        { value: 'Navy Blue', colorHex: '#1E3A8A', sortOrder: 6 },
        { value: 'Emerald Green', colorHex: '#047857', sortOrder: 7 },
      ],
    },
    {
      name: 'Size',
      displayType: 'text',
      sortOrder: 6,
      values: [
        { value: 'XS', sortOrder: 1 },
        { value: 'S', sortOrder: 2 },
        { value: 'M', sortOrder: 3 },
        { value: 'L', sortOrder: 4 },
        { value: 'XL', sortOrder: 5 },
        { value: 'XXL', sortOrder: 6 },
      ],
    },
  ];

  for (const attrDef of attributesToEnsure) {
    let [attr] = await db
      .select()
      .from(globalAttributes)
      .where(eq(globalAttributes.name, attrDef.name))
      .limit(1);

    if (!attr) {
      console.log(`Creating global attribute: ${attrDef.name}`);
      [attr] = await db
        .insert(globalAttributes)
        .values({
          name: attrDef.name,
          displayType: attrDef.displayType,
          sortOrder: attrDef.sortOrder,
          status: 'active',
        })
        .returning();
    } else {
      console.log(`Global attribute exists: ${attrDef.name}`);
    }

    const existingVals = await db
      .select()
      .from(globalAttributeValues)
      .where(eq(globalAttributeValues.attributeId, attr.id));

    const existingValNames = existingVals.map((v) => v.value.toLowerCase());

    for (const valDef of attrDef.values) {
      if (!existingValNames.includes(valDef.value.toLowerCase())) {
        console.log(`  Adding value: ${valDef.value} for ${attrDef.name}`);
        await db.insert(globalAttributeValues).values({
          attributeId: attr.id,
          value: valDef.value,
          colorHex: (valDef as any).colorHex || null,
          sortOrder: valDef.sortOrder,
        });
      }
    }
  }

  await client.end();
  console.log('Universal attributes seeding complete!');
}

seedUniversalAttributes().catch((err) => {
  console.error('Failed to seed attributes:', err);
  process.exit(1);
});
