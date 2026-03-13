import { Request, Response, NextFunction } from "express";
import type { AppError } from "../types/appError.js";

export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
    return res
      .status(409)
      .json({ success: false, message: `Duplicate value for ${field}` });
  }

  const statusCode = err.statusCode ?? 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message ?? "Internal Server Error",
  });
};
