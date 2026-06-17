import { retryPendingEvents } from '../../../actions/event-outbox';

export async function POST() {
  try {
    const results = await retryPendingEvents();

    return Response.json({
      retried: results.length,
      results,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retry pending events',
      },
      { status: 500 },
    );
  }
}
