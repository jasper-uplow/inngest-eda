import {
  db,
  events,
  eventConsumptions,
  and,
  eq,
  lt,
  gte,
  notExists,
  sql,
} from 'db';
import type { Inngest } from 'inngest';
import type { EventEnvelope } from '@source/types';
import { PaymentEvents } from './payment.event';

export const RECONCILE_SLA_MS = 2 * 60_000;
export const MAX_REDELIVERY = 5;

type ReconcileTarget = {
  eventName: string;
  consumer: string;
};

const RECONCILE_TARGETS: ReadonlyArray<ReconcileTarget> = [
  { eventName: PaymentEvents.PurchaseCompleted, consumer: 'order-service' },
];

export type OrphanEvent = typeof events.$inferSelect & {
  consumer: string;
};

export async function recordConsumption(eventId: string, consumer: string) {
  await db
    .insert(eventConsumptions)
    .values({ eventId, consumer })
    .onConflictDoNothing({
      target: [eventConsumptions.eventId, eventConsumptions.consumer],
    });
}

export async function findOrphanEvents(
  now: Date = new Date(),
): Promise<OrphanEvent[]> {
  const cutoff = new Date(now.getTime() - RECONCILE_SLA_MS);
  const orphans: OrphanEvent[] = [];

  for (const target of RECONCILE_TARGETS) {
    const rows = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.eventName, target.eventName),
          eq(events.status, 'published'),
          lt(events.createdAt, cutoff),
          lt(events.redeliveryCount, MAX_REDELIVERY),
          notExists(
            db
              .select({ one: sql`1` })
              .from(eventConsumptions)
              .where(
                and(
                  eq(eventConsumptions.eventId, events.eventId),
                  eq(eventConsumptions.consumer, target.consumer),
                ),
              ),
          ),
        ),
      )
      .limit(50);

    for (const row of rows) {
      orphans.push({ ...row, consumer: target.consumer });
    }
  }

  return orphans;
}

export type ReEmitResult = {
  eventId: string;
  consumer: string;
  ok: boolean;
  error?: string;
};

export async function reEmitOrphans({
  inngest,
}: {
  inngest: Inngest;
}): Promise<ReEmitResult[]> {
  const orphans = await findOrphanEvents();
  const results: ReEmitResult[] = [];

  for (const orphan of orphans) {
    const payload = orphan.payload as EventEnvelope<unknown>;
    const nextRedeliveryCount = orphan.redeliveryCount + 1;

    try {
      await inngest.send({
        id: `reconcile-${payload.eventId}-${nextRedeliveryCount}`,
        name: payload.eventType,
        data: payload,
      });

      await db
        .update(events)
        .set({
          redeliveryCount: nextRedeliveryCount,
          lastReconciledAt: new Date(),
          lastError: null,
        })
        .where(eq(events.id, orphan.id));

      results.push({
        eventId: orphan.eventId,
        consumer: orphan.consumer,
        ok: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to re-emit event';

      await db
        .update(events)
        .set({
          redeliveryCount: nextRedeliveryCount,
          lastReconciledAt: new Date(),
          lastError: message,
        })
        .where(eq(events.id, orphan.id));

      results.push({
        eventId: orphan.eventId,
        consumer: orphan.consumer,
        ok: false,
        error: message,
      });
    }
  }

  return results;
}

export async function quarantineExhausted() {
  const result = await db
    .update(events)
    .set({
      status: 'failed',
      lastError: 'exhausted redeliveries',
    })
    .where(
      and(
        eq(events.status, 'published'),
        gte(events.redeliveryCount, MAX_REDELIVERY),
      ),
    )
    .returning({ id: events.id });

  return { quarantined: result.length };
}
