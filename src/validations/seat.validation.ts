import { z } from "zod";

export const lockSeatsSchema = z.object({
  seatIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid seat id"))
    .min(1)
    .max(10, "Max 10 seats at once"),
  showId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid show id"),
});

export const releaseSeatsSchema = z.object({
  seatIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid seat id"))
    .min(1),
  showId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid show id"),
});

export type LockSeatsInput = z.infer<typeof lockSeatsSchema>;
export type ReleaseSeatsInput = z.infer<typeof releaseSeatsSchema>;
