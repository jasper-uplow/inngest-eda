const receiptServiceUrl =
  process.env.RECEIPT_SERVICE_URL ?? 'http://localhost:3003';

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await context.params;

  try {
    const response = await fetch(
      `${receiptServiceUrl}/api/receipts/${paymentId}`,
      { cache: 'no-store' },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        {
          error:
            (body as { error?: string } | null)?.error ??
            'Failed to fetch receipt',
        },
        { status: response.status },
      );
    }

    return Response.json(body);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Receipt service is unavailable',
      },
      { status: 502 },
    );
  }
}
