'use client';

import { useEffect, useMemo, useState } from 'react';
import { showToast } from '@/lib/toast-store';
import type { Product } from '@/types/product';

type PurchaseModalProps = {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSuccess?: () => void;
};

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

export function PurchaseModal({
  open,
  products,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedProductId(products[0]?.id ?? '');
    setCustomerName('');
    setQuantity(1);
  }, [open, products]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  async function handleConfirmPurchase() {
    if (!selectedProduct) {
      return;
    }

    if (!customerName.trim()) {
      showToast('Customer name is required.', 'error');
      return;
    }

    if (quantity < 1) {
      showToast('Quantity must be at least 1.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          productId: selectedProductId,
          quantity,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (data as { error?: string } | null)?.error ?? 'Purchase failed',
        );
      }

      showToast('Purchase completed successfully.', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Purchase failed',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="purchase-modal-title"
              className="text-xl font-semibold text-slate-900"
            >
              Purchase product
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a product and review the price from the catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleConfirmPurchase();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Customer name
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Product
            </span>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {products.length === 0 ? (
                <option value="">No products available</option>
              ) : (
                products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Price
            </span>
            <input
              type="text"
              readOnly
              value={
                selectedProduct ? formatPrice(selectedProduct.price) : ''
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantity
            </span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProduct || isSubmitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? 'Processing…' : 'Confirm purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
