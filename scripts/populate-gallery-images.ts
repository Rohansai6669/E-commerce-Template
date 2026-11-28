import { loadEnvConfig } from '@next/env';
import postgres from 'postgres';

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    const products = await sql`
      SELECT p.id, p.name, p.slug, count(pi.id) as img_count
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'active'
      GROUP BY p.id, p.name, p.slug
      ORDER BY p.name ASC
    `;

    console.log(`Found ${products.length} active products.`);

    // Curated high-res fashion angle images for denim & streetwear catalog items
    const galleryPresets: Record<string, string[]> = {
      'straight-fit-jeans': [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80', // denim back pocket / fit
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80', // denim texture / fabric close-up
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=1200&q=80', // side profile denim
      ],
      'heavy-fleece-7-inch-athletic-shorts': [
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=80',
      ],
      'oversized-vintage-tee': [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      ],
      'tactical-cargo-pants': [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
      ],
    };

    // Generic high-fashion garment backup angles for products with only 1 image
    const fallbackGarmentAngles = [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    ];

    for (const prod of products) {
      const existingImages = await sql`
        SELECT id, url, sort_order FROM product_images WHERE product_id = ${prod.id} ORDER BY sort_order ASC
      `;

      console.log(`Product "${prod.name}" (${prod.slug}) has ${existingImages.length} images.`);

      const presetUrls = galleryPresets[prod.slug];

      if (existingImages.length <= 1) {
        const anglesToAdd = presetUrls && presetUrls.length > 0 ? presetUrls : fallbackGarmentAngles;
        const currentUrls = new Set(existingImages.map((img: any) => img.url));

        let nextOrder = existingImages.length > 0 ? existingImages[existingImages.length - 1].sort_order + 1 : 1;

        for (const url of anglesToAdd) {
          if (!currentUrls.has(url)) {
            await sql`
              INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
              VALUES (${prod.id}, ${url}, ${`${prod.name} gallery angle`}, false, ${nextOrder})
            `;
            console.log(`  + Added angle: ${url}`);
            currentUrls.add(url);
            nextOrder++;
          }
        }
      } else if (presetUrls) {
        // If it's a specific product like straight-fit-jeans, ensure the preset gallery angles exist
        const currentUrls = new Set(existingImages.map((img: any) => img.url));
        let nextOrder = existingImages[existingImages.length - 1].sort_order + 1;

        for (const url of presetUrls) {
          if (!currentUrls.has(url)) {
            await sql`
              INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
              VALUES (${prod.id}, ${url}, ${`${prod.name} gallery angle`}, false, ${nextOrder})
            `;
            console.log(`  + Added preset angle for ${prod.slug}: ${url}`);
            currentUrls.add(url);
            nextOrder++;
          }
        }
      }
    }

    console.log('✅ Product gallery angles successfully populated!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Error populating gallery images:', err);
    await sql.end();
    process.exit(1);
  }
}

main();
