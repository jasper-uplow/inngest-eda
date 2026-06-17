import { db, events, eq } from 'db';
import type { PurchaseCompletedEvent } from '@source/events';
import { inngest } from '../../client';

export type StoredEvent = typeof events.$inferSelect;

const MAX_PUBLISH_RETRIES = 5;

export async function storeOutboxEvent(
  event: PurchaseCompletedEvent,
  aggregateType: string,
) {
  const [record] = await db
    .insert(events)
    .values({
      eventName: event.eventType,
      eventId: event.eventId,
      eventType: aggregateType,
      payload: event,
      status: 'pending',
    })
    .returning();

  if (!record) {
    throw new Error('Failed to store outbox event');
  }

  return record;
}

export async function publishOutboxEvent(record: StoredEvent) {
  const payload = record.payload as PurchaseCompletedEvent;

  try {
    await inngest.send({
      id: `payment-event-${payload.eventId}`,
      name: payload.eventType,
      data: payload,
    });

    const [updated] = await db
      .update(events)
      .set({
        status: 'published',
        processedAt: new Date(),
        lastError: null,
      })
      .where(eq(events.id, record.id))
      .returning();

    return { ok: true as const, record: updated ?? record };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to publish event';

    const [updated] = await db
      .update(events)
      .set({
        status: record.retryCount + 1 >= MAX_PUBLISH_RETRIES ? 'failed' : 'pending',
        retryCount: record.retryCount + 1,
        lastError: message,
      })
      .where(eq(events.id, record.id))
      .returning();

    return {
      ok: false as const,
      record: updated ?? record,
      error: message,
    };
  }
}

export async function retryPendingEvents(limit = 10) {
  const pending = await db
    .select()
    .from(events)
    .where(eq(events.status, 'pending'))
    .limit(limit);

  const results = [];

  for (const record of pending) {
    results.push({
      eventId: record.eventId,
      ...(await publishOutboxEvent(record)),
    });
  }

  return results;
}
