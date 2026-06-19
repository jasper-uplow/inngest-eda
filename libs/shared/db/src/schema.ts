import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
  decimal,
  jsonb,
} from 'drizzle-orm/pg-core';

export const payments = pgTable(
  'tbl_payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerName: text('customer_name').notNull(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, {
        onDelete: 'restrict',
      }),
    purchasedAt: timestamp('purchasedAt'),
  },
  (table) => [index('product_id').on(table.productId)],
);

export const products = pgTable(
  'tbl_products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productName: text('product_name').notNull(),
    price: decimal('product_price').notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('createdAt'),
  },
  (table) => [
    index('product_name').on(table.productName),
    index('product_price').on(table.price),
    index('quantity').on(table.quantity),
  ],
);

// ------- event -------
export const events = pgTable(
  'tbl_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventName: text('event_name').notNull(),
    eventId: uuid('event_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    status: text('status').notNull().default('pending'),
    retryCount: integer('retry_count').notNull().default(0),
    redeliveryCount: integer('redelivery_count').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
    lastReconciledAt: timestamp('last_reconciled_at'),
  },
  (table) => [
    index('event_name_idx').on(table.eventName),
    index('event_status_idx').on(table.status),
    index('aggregate_id_idx').on(table.eventId),
  ],
);

export const eventConsumptions = pgTable(
  'tbl_event_consumptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').notNull(),
    consumer: text('consumer').notNull(),
    processedAt: timestamp('processed_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('event_consumer_unique').on(table.eventId, table.consumer),
    index('event_consumptions_event_id_idx').on(table.eventId),
  ],
);

// ------ order -------

export const orders = pgTable(
  'tbl_orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentId: uuid('payment_id').notNull().unique(),
    sourceEventId: uuid('source_event_id').notNull(),
    customerName: text('customer_name').notNull(),
    productId: uuid('product_id').notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price').notNull(),
    totalAmount: decimal('total_amount').notNull(),
    status: text('status').notNull().default('confirmed'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('orders_payment_id_idx').on(table.paymentId),
    index('orders_status_idx').on(table.status),
    index('orders_customer_name_idx').on(table.customerName),
  ],
);

// ------ receipt -------

export const receipts = pgTable(
  'tbl_receipts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    receiptNumber: text('receipt_number').notNull().unique(),
    orderId: uuid('order_id').notNull(),
    paymentId: uuid('payment_id').notNull().unique(),
    sourceEventId: uuid('source_event_id').notNull(),
    customerName: text('customer_name').notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price').notNull(),
    totalAmount: decimal('total_amount').notNull(),
    issuedAt: timestamp('issued_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('receipts_payment_id_idx').on(table.paymentId),
    index('receipts_order_id_idx').on(table.orderId),
  ],
);

// export const subscription = pgTable('tbl_subscriptions', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   customerId: text('customer_id').notNull(),
//   customerName: text('customer_name').notNull(),
//   product_id: text('product_id').notNull(),
//   productName: text('product_name').notNull(),
//   isSubscribed: boolean('is_subscribed'),
//   subscribedAt: timestamp(),
// });
