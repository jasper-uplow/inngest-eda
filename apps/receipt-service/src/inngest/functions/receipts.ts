import { OrderEvents, type OrderCreatedEvent } from '@source/events';
import { createReceiptFromOrderEvent } from '../../app/actions/receipts';
import { inngest } from '../../client';

export const createReceiptFromOrder = inngest.createFunction(
  {
    id: 'create-receipt-from-order',
    retries: 3,
    triggers: [{ event: OrderEvents.OrderCreated }],
  },
  async ({ event, step }) => {
    return step.run('create-receipt', async () => {
      return createReceiptFromOrderEvent(event.data as OrderCreatedEvent);
    });
  },
);
