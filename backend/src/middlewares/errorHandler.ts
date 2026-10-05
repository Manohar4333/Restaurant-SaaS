import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public errors?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.');
      formattedErrors[field] = e.message;
    });
    return ApiResponse.badRequest(res, 'Validation failed', 'VALIDATION_ERROR', formattedErrors);
  }

  // App specific operational errors
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.code, err.statusCode, err.errors);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const formattedErrors: Record<string, string> = {};
    for (const key in err.errors) {
      formattedErrors[key] = err.errors[key].message;
    }
    return ApiResponse.badRequest(res, 'Database validation error', 'MONGOOSE_VALIDATION_ERROR', formattedErrors);
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, `Invalid format for field: ${err.path}`, 'INVALID_ID');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.join(', ');
    return ApiResponse.conflict(res, `A record with this ${fieldName} already exists`, 'DUPLICATE_KEY_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token. Please authenticate again.', 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token has expired. Please refresh your session.', 'TOKEN_EXPIRED');
  }

  // Generic fallback
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message || 'Internal server error',
    'INTERNAL_SERVER_ERROR',
    500
  );
}
