import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import AppError from "../utils/AppError.js";

export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return next(new AppError(messages, 400));
    }

    req.body = result.data;
    next();
  };
};
