export type Receipt = {
  id: string;
  receiptNumber: string;
  orderId: string;
  paymentId: string;
  sourceEventId: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  issuedAt: string;
  createdAt: string;
};
