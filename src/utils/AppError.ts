class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // This marks the error as "expected" (like a 404)

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
