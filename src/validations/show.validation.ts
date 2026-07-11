import { z } from "zod";

export const createShowSchema = z
  .object({
    movie: z.string().regex(/^[a-f\d]{24}$/i, "Invalid movie id"),
    theatre: z.string().regex(/^[a-f\d]{24}$/i, "Invalid theatre id"),
    showTime: z
      .string()
      .datetime("Invalid show time")
      .refine(
        (val) => new Date(val) > new Date(),
        "Show time must be in the future",
      ),
    totalSeats: z.number().min(1).max(200),
    standardPrice: z.number().min(0).default(300),
    premiumPrice: z.number().min(0).default(500),
    vipPrice: z.number().min(0).default(700),
  })
  .refine(
    (d) => d.standardPrice <= d.premiumPrice,
    "Standard price must be ≤ premium",
  )
  .refine((d) => d.premiumPrice <= d.vipPrice, "Premium price must be ≤ VIP");

export const updateShowSchema = z.object({
  showTime: z
    .string()
    .datetime()
    .refine(
      (val) => new Date(val) > new Date(),
      "Show time must be in the future",
    ),
});

export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
