import { serve } from 'inngest/next';
import { inngest } from '../../../client';
import { createReceiptFromOrder } from '../../../inngest/functions/receipts';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createReceiptFromOrder],
});
