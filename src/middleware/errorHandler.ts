import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({ success: false, message: messages.join(", ") });
    return;
  }

  console.error("UNEXPECTED ERROR:", err);
  res.status(500).json({ success: false, message: "Something went wrong" });
};

export default errorHandler;
