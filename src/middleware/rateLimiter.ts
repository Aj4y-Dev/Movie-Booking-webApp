import rateLimit from "express-rate-limit";
import { createHash } from "node:crypto";
import { Request } from "express";

const getKey = (req: Request): string => {
  // priority 1: authenticated user
  // comes from verified JWT — cannot be spoofed
  if (req.user?.id) return `user:${req.user.id}`;

  // priority 2 — email in request body
  // hashed so plain email not stored in memory
  // SHA256("ajay@gmail.com") → "a3f2b1..."
  // same email = same hash = same bucket
  // IP rotation has zero effect
  const email = req.body?.email as string;
  if (email)
    return createHash("sha256").update(email.toLowerCase()).digest("hex");

  // priority 3: real TCP socket address
  // NOT req.ip: that reads X-Forwarded-For
  // socket.remoteAddress = actual connection IP
  // cannot be spoofed at application layer
  return req.socket.remoteAddress || "unknown";
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: getKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again after 15 minutes",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: getKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Try again after 15 minutes",
  },
});

export const seatLockLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many seat lock attempts. Try again after 1 minute",
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many booking attempts. Try again after 1 hour",
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: getKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment attempts. Try again after 1 hour",
  },
});
