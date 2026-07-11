import { z } from "zod";

export const createMovieSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().min(20).max(1000).trim(),
  casts: z.array(z.string().trim()).min(1, "At least one cast member required"),
  trailerUrl: z.url("Invalid trailer URL"),
  language: z.array(z.string().trim()).min(1).default(["Nepali"]),
  releaseDate: z.string().datetime("Invalid date format"),
  director: z.string().min(2).trim(),
  releaseStatus: z.enum(["PENDING", "UPCOMING", "RELEASED"]).default("PENDING"),
});

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
