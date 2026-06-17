import { ProductsPage } from '@/components/ProductsPage';
import { fetchProducts } from '@/lib/products';
import type { Product } from '@/types/product';

export default async function Index() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await fetchProducts();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load products';
  }

  return <ProductsPage products={products} error={error} />;
}
