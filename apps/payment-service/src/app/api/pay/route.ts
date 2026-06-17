import { paymentSchema } from '@source/types';
import { purchase } from '../../actions/controllers';

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = paymentSchema.safeParse(json);
  if (!result.success) {
    return Response.json(
      { error: 'Invalid payload', details: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const payment = await purchase(result.data);
    return Response.json(payment, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Purchase failed' },
      { status: 400 },
    );
  }
}
