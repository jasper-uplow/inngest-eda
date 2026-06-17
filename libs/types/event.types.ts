export interface EventEnvelope<T> {
  eventId: string;
  eventType: string;
  occuredAt: string;
  version: number;
  data: T;
}
