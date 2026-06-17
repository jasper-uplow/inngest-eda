import { getProducts } from '../../actions/controllers';

export async function GET() {
  try {
    const rows = await getProducts();
    return Response.json(rows);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
