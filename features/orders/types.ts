import { z } from "zod";
import {
  orderStatusSchema,
  orderItemSchema,
  orderSchema,
  fulfillOrderResultSchema,
  refundOrderInputSchema,
  refundOrderResultSchema,
} from "./schemas";

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type FulfillOrderResult = z.infer<typeof fulfillOrderResultSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderInputSchema>;
export type RefundOrderResult = z.infer<typeof refundOrderResultSchema>;
