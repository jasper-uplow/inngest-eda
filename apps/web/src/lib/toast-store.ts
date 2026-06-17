type ToastType = 'success' | 'error';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastListener = (toasts: Toast[]) => void;

type ToastStore = {
  toasts: Toast[];
  listeners: Set<ToastListener>;
};

const globalStore = globalThis as typeof globalThis & {
  __microservicesWebToastStore?: ToastStore;
};

function getStore(): ToastStore {
  if (!globalStore.__microservicesWebToastStore) {
    globalStore.__microservicesWebToastStore = {
      toasts: [],
      listeners: new Set(),
    };
  }

  return globalStore.__microservicesWebToastStore;
}

function emit() {
  const store = getStore();

  for (const listener of store.listeners) {
    listener(store.toasts);
  }
}

export function subscribeToToasts(listener: ToastListener) {
  const store = getStore();

  store.listeners.add(listener);
  listener(store.toasts);

  return () => {
    store.listeners.delete(listener);
  };
}

export function showToast(message: string, type: ToastType) {
  const store = getStore();

  store.toasts = [
    ...store.toasts,
    { id: Date.now() + Math.random(), message, type },
  ];
  emit();
}

export function dismissOldestToast() {
  const store = getStore();

  if (store.toasts.length === 0) {
    return;
  }

  store.toasts = store.toasts.slice(1);
  emit();
}
