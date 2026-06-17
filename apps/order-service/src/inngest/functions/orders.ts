import type { PurchaseCompletedEvent } from '@source/events';
import { PaymentEvents } from '@source/events';
import { createOrderFromPaymentEvent } from '../../app/actions/orders';
import { inngest } from '../../client';

export const createOrderFromPayment = inngest.createFunction(
  {
    id: 'create-order-from-payment',
    retries: 3,
    triggers: [{ event: PaymentEvents.PurchaseCompleted }],
  },
  async ({ event, step }) => {
    return step.run('create-order', async () => {
      return createOrderFromPaymentEvent(
        event.data as PurchaseCompletedEvent,
      );
    });
  },
);
