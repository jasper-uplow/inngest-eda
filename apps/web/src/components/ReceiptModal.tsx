'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Receipt } from '@/types/receipt';

type ReceiptModalProps = {
  paymentId: string | null;
  onClose: () => void;
};

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 20;

function formatCurrency(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ReceiptModal({ paymentId, onClose }: ReceiptModalProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    setReceipt(null);
    setError(null);
    setTimedOut(false);
    setAttempt(0);

    async function poll() {
      while (!cancelled) {
        attempts += 1;
        setAttempt(attempts);

        try {
          const response = await fetch(`/api/receipts/${paymentId}`, {
            cache: 'no-store',
          });

          if (response.ok) {
            const data = (await response.json()) as Receipt;
            if (!cancelled) {
              setReceipt(data);
            }
            return;
          }

          if (response.status !== 404) {
            const body = await response.json().catch(() => null);
            const message =
              (body as { error?: string } | null)?.error ??
              'Failed to load receipt';
            if (!cancelled) {
              setError(message);
            }
            return;
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : 'Failed to load receipt',
            );
          }
          return;
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          if (!cancelled) {
            setTimedOut(true);
          }
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    void poll();

    return () => {
      cancelled = true;
    };
  }, [paymentId, retryToken]);

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [paymentId, onClose]);

  const handleRetry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  if (!paymentId) {
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
        aria-labelledby="receipt-modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="receipt-modal-title"
              className="text-xl font-semibold text-slate-900"
            >
              Receipt
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {receipt
                ? `Order ${receipt.receiptNumber}`
                : 'Generating your receipt…'}
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

        {receipt ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Receipt #
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {receipt.receiptNumber}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </dt>
                <dd className="mt-1 text-slate-900">{receipt.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Issued
                </dt>
                <dd className="mt-1 text-slate-900">
                  {formatDate(receipt.issuedAt)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </dt>
                <dd className="mt-1 text-slate-900">{receipt.productName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Quantity
                </dt>
                <dd className="mt-1 text-slate-900">{receipt.quantity}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unit price
                </dt>
                <dd className="mt-1 text-slate-900">
                  {formatCurrency(receipt.unitPrice)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatCurrency(receipt.totalAmount)}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Retry
              </button>
            </div>
          </div>
        ) : timedOut ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your receipt is taking longer than expected. It should appear
              shortly — you can retry now or close and check again later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-slate-600">
              Waiting for receipt-service to process your order
              {attempt > 0 ? ` (attempt ${attempt}/${MAX_POLL_ATTEMPTS})` : ''}
              …
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
