import {
  quarantineExhausted,
  reEmitOrphans,
  retryPendingEvents,
} from '@source/events';
import { inngest } from '../../client';

export const reconcileOutbox = inngest.createFunction(
  {
    id: 'reconcile-outbox',
    triggers: [{ cron: '* * * * *' }],
  },
  async ({ step }) => {
    const drained = await step.run('drain-pending', () =>
      retryPendingEvents({ inngest }, 50),
    );

    const reemitted = await step.run('reemit-orphans', () =>
      reEmitOrphans({ inngest }),
    );

    const quarantined = await step.run('quarantine', () =>
      quarantineExhausted(),
    );

    return {
      drained: drained.length,
      reemitted: reemitted.length,
      quarantined: quarantined.quarantined,
    };
  },
);
