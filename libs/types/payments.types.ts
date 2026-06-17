import { z } from 'zod';

export const paymentSchema = z.object({
  customerName: z.string().nonempty(),
  productId: z.uuid().nonempty(),
  quantity: z.number().nonoptional(),
});

export type Payment = z.infer<typeof paymentSchema>;
