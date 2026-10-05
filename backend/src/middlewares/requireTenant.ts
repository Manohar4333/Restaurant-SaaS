import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants';
import { ApiResponse } from '../utils/apiResponse';

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'User not authenticated');
  }

  // Super Admin may perform tenant-less operations or specify tenantId via route parameter
  if (req.user.role === UserRole.SUPER_ADMIN) {
    // If tenantId is in params or query, Super Admin can inspect it
    if (req.params.tenantId) {
      req.tenantId = req.params.tenantId;
    }
    return next();
  }

  // Admin users MUST have a tenantId associated with their JWT
  if (!req.user.tenantId) {
    return ApiResponse.forbidden(res, 'No tenant associated with this account', 'NO_TENANT_CONTEXT');
  }

  // Strictly enforce tenant context from authenticated user
  req.tenantId = req.user.tenantId;
  next();
}
