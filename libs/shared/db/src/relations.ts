import { relations } from 'drizzle-orm';
import { payments, products } from './schema';

export const userRelations = relations(payments, ({ one }) => ({
  product: one(products, {
    fields: [payments.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  payments: many(payments),
}));
