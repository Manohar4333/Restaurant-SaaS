import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';
import { JwtUserPayload } from '../types/express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Authentication token is missing', 'NO_TOKEN');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired authentication token', 'INVALID_TOKEN');
  }
}
