import { db, receipts, eq } from 'db';
import { recordConsumption, type OrderCreatedEvent } from '@source/events';

const CONSUMER_NAME = 'receipt-service';

function buildReceiptNumber(orderId: string) {
  return `RCPT-${orderId.slice(0, 8).toUpperCase()}`;
}

export async function createReceiptFromOrderEvent(
  orderEvent: OrderCreatedEvent,
) {
  const { data } = orderEvent;

  const [existingReceipt] = await db
    .select()
    .from(receipts)
    .where(eq(receipts.paymentId, data.paymentId))
    .limit(1);

  if (existingReceipt) {
    await recordConsumption(orderEvent.eventId, CONSUMER_NAME);
    return { receipt: existingReceipt };
  }

  const [insertedReceipt] = await db
    .insert(receipts)
    .values({
      receiptNumber: buildReceiptNumber(data.orderId),
      orderId: data.orderId,
      paymentId: data.paymentId,
      sourceEventId: orderEvent.eventId,
      customerName: data.customerName,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.totalAmount,
    })
    .onConflictDoNothing({ target: receipts.paymentId })
    .returning();

  if (insertedReceipt) {
    await recordConsumption(orderEvent.eventId, CONSUMER_NAME);
    return { receipt: insertedReceipt };
  }

  const [raced] = await db
    .select()
    .from(receipts)
    .where(eq(receipts.paymentId, data.paymentId))
    .limit(1);

  if (!raced) {
    throw new Error('Failed to create receipt');
  }

  await recordConsumption(orderEvent.eventId, CONSUMER_NAME);
  return { receipt: raced };
}

export async function getReceiptByPaymentId(paymentId: string) {
  const [receipt] = await db
    .select()
    .from(receipts)
    .where(eq(receipts.paymentId, paymentId))
    .limit(1);

  return receipt ?? null;
}
