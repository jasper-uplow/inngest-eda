const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${paymentServiceUrl}/api/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json(
        {
          error:
            (data as { error?: string } | null)?.error ?? 'Purchase failed',
          details: (data as { details?: unknown } | null)?.details,
        },
        { status: response.status },
      );
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Payment service is unavailable',
      },
      { status: 502 },
    );
  }
}
