import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import AppError from "../utils/AppError.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      return next(new AppError(messages, 400));
    }
    req.body = result.data;
    next();
  };
};
