import { headers } from 'next/headers';
import type { Product } from '@/types/product';

export async function fetchProducts(): Promise<Product[]> {
  const headersList = await headers();
  const host =
    headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';

  const response = await fetch(`${protocol}://${host}/api/products`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ?? 'Failed to load products';
    throw new Error(message);
  }

  return response.json();
}
