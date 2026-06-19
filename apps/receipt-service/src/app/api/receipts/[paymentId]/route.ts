import { getReceiptByPaymentId } from '../../../actions/receipts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await context.params;

  try {
    const receipt = await getReceiptByPaymentId(paymentId);

    if (!receipt) {
      return Response.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return Response.json(receipt);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch receipt',
      },
      { status: 500 },
    );
  }
}
