import { EventEnvelope } from '@source/types';

export const OrderEvents = {
  OrderCreated: 'order.created',
} as const;

export type OrderCreatedPayload = {
  orderId: string;
  paymentId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
};

export type OrderCreatedEvent = EventEnvelope<OrderCreatedPayload>;
