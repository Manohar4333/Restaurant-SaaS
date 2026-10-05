import { UserRole } from '../constants';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      tenantId?: string;
    }
  }
}
