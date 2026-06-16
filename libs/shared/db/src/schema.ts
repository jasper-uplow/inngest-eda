import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
  decimal,
} from 'drizzle-orm/pg-core';

export const payments = pgTable(
  'tbl_payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerName: text('customer_name').notNull(),
    productId: uuid('product_id').references(() => products.id, {
      onDelete: 'cascade',
    }),
    purchasedAt: timestamp(),
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
    createdAt: timestamp(),
  },
  (table) => [
    index('product_name').on(table.productName),
    index('product_price').on(table.price),
    index('quantity').on(table.quantity),
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
