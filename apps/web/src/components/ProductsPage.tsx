'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';
import { ActionButtons } from '@/components/ActionButtons';
import { ProductsTable } from '@/components/ProductsTable';
import { PurchaseModal } from '@/components/PurchaseModal';
import { ReceiptModal } from '@/components/ReceiptModal';

type ProductsPageProps = {
  products: Product[];
  error?: string | null;
};

export function ProductsPage({ products, error }: ProductsPageProps) {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Microservices Store
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Product catalog
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Browse available products, start a purchase, or subscribe for
              updates.
            </p>
          </div>

          <ActionButtons
            onPurchaseClick={() => setIsPurchaseOpen(true)}
            onSubscribeClick={() => {
              window.alert('Subscribe flow coming soon.');
            }}
          />
        </div>

        <ProductsTable products={products} />

        {error ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}. Make sure payment-service is running and seeded.
          </p>
        ) : null}
      </div>

      <PurchaseModal
        open={isPurchaseOpen}
        products={products}
        onClose={() => setIsPurchaseOpen(false)}
        onSuccess={(paymentId) => {
          router.refresh();
          setReceiptPaymentId(paymentId);
        }}
      />

      <ReceiptModal
        paymentId={receiptPaymentId}
        onClose={() => setReceiptPaymentId(null)}
      />
    </main>
  );
}
