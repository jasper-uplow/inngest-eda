import type { Product } from '@/types/product';

type ProductsTableProps = {
  products: Product[];
};

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Price
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No products available.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="transition hover:bg-slate-50/80">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {product.productName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {product.quantity}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
