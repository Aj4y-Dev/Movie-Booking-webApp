import { z } from "zod";

export const initiatePaymentSchema = z.object({
  bookingId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid booking id"),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
