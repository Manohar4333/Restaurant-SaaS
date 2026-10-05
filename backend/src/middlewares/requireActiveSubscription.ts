import { Request, Response, NextFunction } from 'express';
import { UserRole, SubscriptionStatus } from '../constants';
import { ApiResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  // Super Admins bypass subscription checks
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Customers do not have subscription checks
  if (req.user?.role === UserRole.CUSTOMER) {
    return next();
  }

  const tenantId = req.tenantId || req.user?.tenantId;
  if (!tenantId) {
    return ApiResponse.forbidden(res, 'Tenant context missing', 'TENANT_REQUIRED');
  }

  try {
    const Subscription = mongoose.model('Subscription');
    const subscription = await Subscription.findOne({ tenantId });

    if (!subscription) {
      return ApiResponse.error(
        res,
        'No active subscription found for this business. Please subscribe to a plan.',
        'NO_SUBSCRIPTION',
        402
      );
    }

    const allowedStatuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.GRACE_PERIOD];

    if (!allowedStatuses.includes(subscription.status as SubscriptionStatus)) {
      return ApiResponse.error(
        res,
        `Your subscription is currently ${subscription.status}. Please make a payment to restore access.`,
        'SUBSCRIPTION_SUSPENDED',
        402,
        {
          subscriptionStatus: subscription.status,
          expiryDate: subscription.expiryDate,
          gracePeriodEndDate: subscription.gracePeriodEndDate,
        }
      );
    }

    next();
  } catch (error) {
    // If Subscription model is not registered yet or DB is initializing, continue gracefully in early phase
    next();
  }
}
