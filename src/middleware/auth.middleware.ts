import { Request, Response, NextFunction } from "express";

// extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "CLIENT" | "USER" | "SYSTEM_ADMIN" | "ROOT_ADMIN";
      };
    }
  }
}
