import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { type CreateOrderParams } from '../src/core/order/order.types';

async function runConcurrencyTests() {
  console.log('--- STARTING ORDER NUMBER CONCURRENCY & CONSTRAINT TEST SUITE ---');

  const { orderRepository } = await import('../src/core/order/order.repository');
  const { db } = await import('../src/lib/db');
  const { orders } = await import('../src/lib/db/schema/order');
  const { eq } = await import('drizzle-orm');

  // Test A: 50-way concurrent OrderRepository.create() execution
  console.log('Test A: Executing 50 simultaneous order checkout calls...');

  const dummyParams: CreateOrderParams = {
    subtotal: 100,
    tax: 10,
    shipping: 5,
    discount: 0,
    total: 115,
    items: [],
    guestEmail: 'concurrency-test@example.com',
    couponCode: null,
    orderNotes: '',
    address: {
      firstName: 'Test',
      lastName: 'User',
      email: 'concurrency-test@example.com',
      addressLine1: '123 Main St',
      addressLine2: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
      phone: '+919999999999',
    },
    shippingMethod: {
      id: 'sm1',
      name: 'Standard',
      price: 5,
      estimatedDays: 3,
      carrier: 'USPS',
      description: 'Standard Ground Shipping',
    },
    paymentMethod: {
      type: 'card',
      brand: 'visa',
      last4: '4242',
    },
  };

  const createPromises = Array.from({ length: 50 }, () => orderRepository.create(dummyParams));
  const results = await Promise.all(createPromises);

  const orderNumbers = results.map((r) => r.orderNumber);
  const uniqueNumbers = new Set(orderNumbers);

  console.log(`Created ${results.length} orders.`);
  console.log(`Unique order numbers generated: ${uniqueNumbers.size}`);

  if (results.length !== 50 || uniqueNumbers.size !== 50) {
    throw new Error(`FAILED Test A: Expected 50 unique order numbers under concurrency, got ${uniqueNumbers.size}`);
  }
  console.log('✓ PASS Test A: 50-way concurrent checkouts created 50 distinct order numbers');

  // Test B: Database-level UNIQUE constraint enforcement
  console.log('Test B: Testing duplicate order_number database constraint rejection...');
  const duplicateNum = 'TEST-DUP-ORDER-999';

  // Ensure any previous test artifact is cleared
  await db.delete(orders).where(eq(orders.orderNumber, duplicateNum));

  await db.insert(orders).values({
    orderNumber: duplicateNum,
    subtotal: '10.00',
    totalAmount: '10.00',
    shippingAddress: dummyParams.address,
  });

  let duplicateRejected = false;
  try {
    await db.insert(orders).values({
      orderNumber: duplicateNum,
      subtotal: '10.00',
      totalAmount: '10.00',
      shippingAddress: dummyParams.address,
    });
  } catch (err: any) {
    if (
      err?.code === '23505' ||
      err?.cause?.code === '23505' ||
      err?.message?.includes('unique') ||
      err?.message?.includes('duplicate') ||
      err?.message?.includes('23505')
    ) {
      duplicateRejected = true;
    }
  }

  // Cleanup test row
  await db.delete(orders).where(eq(orders.orderNumber, duplicateNum));

  if (!duplicateRejected) {
    throw new Error('FAILED Test B: Database UNIQUE constraint failed to reject duplicate order_number.');
  }
  console.log('✓ PASS Test B: Database UNIQUE constraint rejected duplicate order_number with 23505 code');

  console.log('--- ALL CONCURRENCY & CONSTRAINT TESTS PASSED CLEANLY ---');
}

runConcurrencyTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
