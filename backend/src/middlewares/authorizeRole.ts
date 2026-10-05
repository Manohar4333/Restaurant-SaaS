import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants';
import { ApiResponse } from '../utils/apiResponse';

export function authorizeRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Role ${req.user.role} is not permitted to perform this action.`,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}
