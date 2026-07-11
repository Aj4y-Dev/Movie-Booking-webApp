import { z } from "zod";

export const createBookingSchema = z.object({
  show: z.string().regex(/^[a-f\d]{24}$/i, "Invalid show id"),
  seats: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid seat id"))
    .min(1)
    .max(10, "Max 10 seats per booking"),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(200).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
