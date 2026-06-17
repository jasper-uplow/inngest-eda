import { EventEnvelope } from '@source/types';

export const PaymentEvents = {
  PurchaseCompleted: 'payment.purchase-completed',
  PurchaseFailed: 'payment.purchase-failed',
} as const;

export type PaymentPurchaseCompleted = {
  paymentId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
};

export type PurchaseCompletedEvent = EventEnvelope<PaymentPurchaseCompleted>;
