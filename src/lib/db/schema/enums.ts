import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'staff', 'admin', 'vendor', 'supplier']);
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded']);
export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', ['inbound', 'outbound', 'reservation_hold', 'reservation_release', 'adjustment']);
export const notificationTypeEnum = pgEnum('notification_type', ['order_update', 'promotional', 'system']);

// Marketplace Enums
export const supplierStatusEnum = pgEnum('supplier_status', ['pending', 'active', 'suspended', 'rejected', 'archived']);
export const supplierAddressTypeEnum = pgEnum('supplier_address_type', ['pickup', 'return', 'billing']);
export const supplierDocumentTypeEnum = pgEnum('supplier_document_type', ['gst', 'pan', 'msme', 'brand_agreement', 'kyc']);
export const supplierLedgerReferenceTypeEnum = pgEnum('supplier_ledger_reference_type', ['sale', 'refund', 'payout', 'adjustment']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in-progress', 'pending-customer', 'closed']);
export const ticketEventTypeEnum = pgEnum('ticket_event_type', ['assigned', 'priority_changed', 'status_changed', 'refund_approved', 'customer_replied', 'supplier_replied']);
export const returnStatusEnum = pgEnum('return_status', ['requested', 'approved', 'item_received', 'qc_passed', 'qc_failed', 'refunded', 'rejected']);
export const returnQcResultEnum = pgEnum('return_qc_result', ['pass', 'fail']);
export const inventoryMovementReasonEnum = pgEnum('inventory_movement_reason', ['SALE', 'RETURN', 'PURCHASE', 'ADJUSTMENT', 'TRANSFER', 'CANCEL']);
