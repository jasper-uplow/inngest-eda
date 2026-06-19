import { serve } from 'inngest/next';
import { inngest } from '../../../client';
import { reconcileOutbox } from '../../../inngest/functions/reconcile';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [reconcileOutbox],
});
