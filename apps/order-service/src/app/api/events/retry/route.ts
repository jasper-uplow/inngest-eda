import { outbox } from '../../../../client';

export async function POST() {
  try {
    const results = await outbox.retryPendingEvents();

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
