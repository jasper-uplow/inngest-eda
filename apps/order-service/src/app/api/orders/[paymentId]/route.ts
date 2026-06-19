import { getOrderByPaymentId } from '../../../actions/orders';

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await context.params;

  try {
    const order = await getOrderByPaymentId(paymentId);

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(order);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch order',
      },
      { status: 500 },
    );
  }
}
