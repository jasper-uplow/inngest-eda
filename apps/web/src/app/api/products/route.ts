import type { Product } from '@/types/product';

const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${paymentServiceUrl}/api/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return Response.json(
        {
          error:
            (body as { error?: string } | null)?.error ??
            'Failed to fetch products from payment-service',
        },
        { status: response.status },
      );
    }

    const products = (await response.json()) as Product[];
    return Response.json(products);
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
