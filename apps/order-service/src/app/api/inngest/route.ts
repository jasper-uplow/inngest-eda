import { serve } from 'inngest/next';
import { inngest } from '../../../client';
import { createOrderFromPayment } from '../../../inngest/functions/orders';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createOrderFromPayment],
});
