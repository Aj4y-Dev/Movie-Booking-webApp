import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ error: "Name is required" }).min(2).max(50).trim(),
  email: z.email("Invalid email format").toLowerCase().trim(),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
