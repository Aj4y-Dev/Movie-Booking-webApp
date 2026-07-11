import { z } from "zod";

export const createTheatreSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  city: z.string().min(2).trim(),
  postalCode: z.string().regex(/^\d{5}$/, "Must be exactly 5 digits"),
  address: z.string().min(5).max(200).trim(),
  owner: z.string().regex(/^[a-f\d]{24}$/i, "Invalid owner id"),
});

export const updateTheatreSchema = createTheatreSchema.partial();

export type CreateTheatreInput = z.infer<typeof createTheatreSchema>;
export type UpdateTheatreInput = z.infer<typeof updateTheatreSchema>;
