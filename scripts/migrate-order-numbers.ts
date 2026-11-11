import { loadEnvConfig } from '@next/env';
import crypto from 'crypto';

loadEnvConfig(process.cwd());

function generateCanonicalOrderNumber(date: Date = new Date()): string {
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const token = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `ORD-${yy}${mm}-${token}`;
}

async function migrateOrderNumbers() {
  console.log('--- STARTING IDEMPOTENT COLLISION-SAFE ORDER NUMBER MIGRATION ---');

  const { db } = await import('../src/lib/db');
  const { orders } = await import('../src/lib/db/schema/order');
  const { isNull, eq, sql } = await import('drizzle-orm');

  // 1. Fetch all orders requiring backfill (where order_number IS NULL)
  const unmigratedOrders = await db
    .select({
      id: orders.id,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(isNull(orders.orderNumber));

  console.log(`Found ${unmigratedOrders.length} unmigrated orders.`);

  if (unmigratedOrders.length === 0) {
    console.log('✓ All existing orders already have canonical order_number values. Nothing to backfill.');
    return;
  }

  // Fetch all existing populated order_numbers to guarantee collision avoidance
  const existingRows = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(sql`${orders.orderNumber} IS NOT NULL`);

  const assignedNumbers = new Set<string>(
    existingRows.map((r) => r.orderNumber!).filter(Boolean)
  );

  let updatedCount = 0;

  for (const row of unmigratedOrders) {
    const jsonbAddress = row.shippingAddress as Record<string, any> | null;
    let targetOrderNumber = jsonbAddress?.orderNumber?.toString().trim().toUpperCase();

    // If missing or collides with already assigned numbers, generate fresh unique token
    if (!targetOrderNumber || assignedNumbers.has(targetOrderNumber)) {
      let attempts = 0;
      do {
        targetOrderNumber = generateCanonicalOrderNumber(row.createdAt ? new Date(row.createdAt) : new Date());
        attempts++;
      } while (assignedNumbers.has(targetOrderNumber) && attempts < 100);
    }

    assignedNumbers.add(targetOrderNumber);

    await db
      .update(orders)
      .set({ orderNumber: targetOrderNumber })
      .where(eq(orders.id, row.id));

    updatedCount++;
  }

  // 2. Verification Pass: Ensure zero NULLs and zero duplicates remain
  const remainingNulls = await db
    .select({ id: orders.id })
    .from(orders)
    .where(isNull(orders.orderNumber));

  if (remainingNulls.length > 0) {
    throw new Error(`Migration verification failed: ${remainingNulls.length} NULL order numbers remain.`);
  }

  const duplicates = await db.execute(sql`
    SELECT order_number, COUNT(*) as count 
    FROM orders 
    WHERE order_number IS NOT NULL 
    GROUP BY order_number 
    HAVING COUNT(*) > 1
  `);

  if (duplicates.length > 0) {
    throw new Error(`Migration verification failed: Duplicate order numbers detected.`);
  }

  console.log(`✓ Successfully backfilled ${updatedCount} orders.`);
  console.log('✓ Verification check passed: 0 NULLs, 0 Duplicates.');
  console.log('--- MIGRATION COMPLETE ---');
}

migrateOrderNumbers().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
