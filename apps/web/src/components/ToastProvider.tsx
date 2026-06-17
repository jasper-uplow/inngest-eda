'use client';

import { useEffect, useState } from 'react';
import {
  dismissOldestToast,
  subscribeToToasts,
  type Toast,
} from '@/lib/toast-store';

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToToasts(setVisibleToasts), []);

  useEffect(() => {
    if (visibleToasts.length === 0) {
      return;
    }

    const timer = window.setTimeout(dismissOldestToast, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [visibleToasts]);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {visibleToasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
