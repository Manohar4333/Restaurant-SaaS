import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, message: string = 'Success', data?: T, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null
    });
  }

  static created<T>(res: Response, message: string = 'Created successfully', data?: T) {
    return this.success(res, message, data, 201);
  }

  static error(res: Response, message: string = 'An error occurred', code: string = 'INTERNAL_ERROR', statusCode: number = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(errors ? { errors } : {})
    });
  }

  static badRequest(res: Response, message: string = 'Bad request', code: string = 'BAD_REQUEST', errors?: any) {
    return this.error(res, message, code, 400, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    return this.error(res, message, code, 401);
  }

  static forbidden(res: Response, message: string = 'Access denied', code: string = 'FORBIDDEN') {
    return this.error(res, message, code, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    return this.error(res, message, code, 404);
  }

  static conflict(res: Response, message: string = 'Resource already exists', code: string = 'CONFLICT') {
    return this.error(res, message, code, 409);
  }
}
