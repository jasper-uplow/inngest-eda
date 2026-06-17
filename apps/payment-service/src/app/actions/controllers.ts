import { db, products, eq, payments, and, gte } from 'db';
import { Payment } from '@source/types';
import { PaymentEvents, PurchaseCompletedEvent } from '@source/events';
import { outbox } from '../../client';

export async function getProducts() {
  return db.select().from(products);
}

export async function purchase(payload: Payment) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, payload.productId));

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.quantity < payload.quantity) {
    throw new Error('Insufficient stock');
  }

  const [paymentRecord] = await db
    .insert(payments)
    .values({
      customerName: payload.customerName,
      productId: product.id,
      purchasedAt: new Date(),
    })
    .returning();

  if (!paymentRecord) {
    throw new Error('Error purchasing product');
  }

  const [updatedProduct] = await db
    .update(products)
    .set({ quantity: product.quantity - payload.quantity })
    .where(
      and(
        eq(products.id, product.id),
        gte(products.quantity, payload.quantity),
      ),
    )
    .returning();

  if (!updatedProduct) {
    throw new Error('Insufficient stock');
  }

  const event: PurchaseCompletedEvent = {
    eventId: paymentRecord.id,
    eventType: PaymentEvents.PurchaseCompleted,
    occuredAt: new Date().toISOString(),
    version: 1.0,
    data: {
      paymentId: paymentRecord.id,
      customerName: paymentRecord.customerName,
      productId: product.id,
      productName: product.productName,
      productPrice: product.price,
      quantity: payload.quantity,
    },
  };

  const storedEvent = await outbox.storeOutboxEvent(event, 'payment');
  const publishResult = await outbox.publishOutboxEvent(storedEvent);

  return {
    payment: paymentRecord,
    product: updatedProduct,
    event: {
      id: storedEvent.id,
      status: publishResult.record.status,
      published: publishResult.ok,
      ...(publishResult.ok ? {} : { publishError: publishResult.error }),
    },
  };
}
