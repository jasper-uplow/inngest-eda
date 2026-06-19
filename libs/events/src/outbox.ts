import { db, events, eq } from 'db';
import type { Inngest } from 'inngest';
import type { EventEnvelope } from '@source/types';

export type StoredEvent = typeof events.$inferSelect;

const MAX_PUBLISH_RETRIES = 5;

export type EventOutboxOptions = {
  inngest: Inngest;
  idPrefix?: string;
};

function buildInngestEventId(
  event: EventEnvelope<unknown>,
  idPrefix?: string,
): string {
  if (idPrefix) {
    return `${idPrefix}-${event.eventId}`;
  }

  return `${event.eventType}-${event.eventId}`;
}

export async function storeOutboxEvent<T>(
  event: EventEnvelope<T>,
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

export async function publishOutboxEvent(
  record: StoredEvent,
  options: EventOutboxOptions,
) {
  const payload = record.payload as EventEnvelope<unknown>;

  try {
    await options.inngest.send({
      id: buildInngestEventId(payload, options.idPrefix),
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
        status:
          record.retryCount + 1 >= MAX_PUBLISH_RETRIES ? 'failed' : 'pending',
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

export async function retryPendingEvents(
  options: EventOutboxOptions,
  limit = 10,
) {
  const pending = await db
    .select()
    .from(events)
    .where(eq(events.status, 'pending'))
    .limit(limit);

  const results = [];

  for (const record of pending) {
    results.push({
      eventId: record.eventId,
      ...(await publishOutboxEvent(record, options)),
    });
  }

  return results;
}

export function createEventOutbox(options: EventOutboxOptions) {
  return {
    storeOutboxEvent: <T>(event: EventEnvelope<T>, aggregateType: string) =>
      storeOutboxEvent(event, aggregateType),
    publishOutboxEvent: (record: StoredEvent) =>
      publishOutboxEvent(record, options),
    retryPendingEvents: (limit?: number) =>
      retryPendingEvents(options, limit),
  };
}
