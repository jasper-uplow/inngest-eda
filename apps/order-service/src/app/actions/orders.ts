import { db, orders, eq } from 'db';
import {
  OrderEvents,
  type OrderCreatedEvent,
  type PurchaseCompletedEvent,
} from '@source/events';
import { outbox } from '../../client';

function calculateTotalAmount(unitPrice: string, quantity: number) {
  return (Number(unitPrice) * quantity).toFixed(2);
}

export async function createOrderFromPaymentEvent(
  purchaseEvent: PurchaseCompletedEvent,
) {
  const { data } = purchaseEvent;

  const [existingOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentId, data.paymentId))
    .limit(1);

  if (existingOrder) {
    return { order: existingOrder };
  }

  const [order] = await db
    .insert(orders)
    .values({
      paymentId: data.paymentId,
      sourceEventId: purchaseEvent.eventId,
      customerName: data.customerName,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.productPrice,
      totalAmount: calculateTotalAmount(data.productPrice, data.quantity),
      status: 'confirmed',
      updatedAt: new Date(),
    })
    .returning();

  if (!order) {
    throw new Error('Failed to create order');
  }

  const event: OrderCreatedEvent = {
    eventId: order.id,
    eventType: OrderEvents.OrderCreated,
    occuredAt: new Date().toISOString(),
    version: 1.0,
    data: {
      orderId: order.id,
      paymentId: order.paymentId,
      customerName: order.customerName,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalAmount: order.totalAmount,
    },
  };

  const storedEvent = await outbox.storeOutboxEvent(event, 'order');
  const publishResult = await outbox.publishOutboxEvent(storedEvent);

  return {
    order,
    event: {
      id: storedEvent.id,
      status: publishResult.record.status,
      published: publishResult.ok,
      ...(publishResult.ok ? {} : { publishError: publishResult.error }),
    },
  };
}

export async function getOrderByPaymentId(paymentId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentId, paymentId))
    .limit(1);

  return order ?? null;
}
