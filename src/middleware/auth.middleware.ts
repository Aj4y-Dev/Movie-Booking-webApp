import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/user.model.js";

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

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      throw new AppError("Access token required", 401);

    const token = authHeader.split(" ")[1];

    // verify with PUBLIC key
    const decoded = verifyToken(token);
    if (decoded.type !== "access")
      throw new AppError("Invalid token type", 401);

    // check user exists
    const user = await User.findById(decoded.userId);
    if (!user) throw new AppError("User no longer exists", 401);

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
