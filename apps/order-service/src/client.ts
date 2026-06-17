import { createInngestClient } from '@source/inngest';
import { createEventOutbox } from '@source/events';

export const inngest = createInngestClient('order-service');
export const outbox = createEventOutbox({
  inngest,
  idPrefix: 'order-event',
});
