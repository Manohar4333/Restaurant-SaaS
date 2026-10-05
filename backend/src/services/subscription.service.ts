import { Subscription, SubscriptionPlan, Tenant, AuditLog } from '../models';
import { SubscriptionStatus, TenantStatus, BillingCycle } from '../constants';
import { AppError } from '../middlewares/errorHandler';

export class SubscriptionService {
  static async getTenantSubscription(tenantId: string) {
    const subscription = await Subscription.findOne({ tenantId }).populate('planId');
    if (!subscription) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    return subscription;
  }

  static async listPlans() {
    return SubscriptionPlan.find({ status: 'ACTIVE' }).sort({ price: 1 });
  }

  static async createPlan(data: any) {
    return SubscriptionPlan.create(data);
  }

  static async updatePlan(planId: string, data: any) {
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, { $set: data }, { new: true });
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    return plan;
  }

  static async deletePlan(planId: string) {
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, { status: 'INACTIVE' }, { new: true });
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    return true;
  }

  static async listAllSubscriptions() {
    return Subscription.find()
      .populate('tenantId', 'businessName slug email phone status')
      .populate('planId', 'name price billingCycle')
      .sort({ createdAt: -1 });
  }

  /**
   * Evaluates expiring subscriptions and transitions states (Idempotent job runner)
   */
  static async checkSubscriptionStatuses() {
    const now = new Date();
    console.log(`[SubscriptionJob] Checking subscription statuses at ${now.toISOString()}...`);

    // 1. Mark expired active subscriptions into GRACE_PERIOD or PAYMENT_PENDING
    const dueSubscriptions = await Subscription.find({
      status: SubscriptionStatus.ACTIVE,
      expiryDate: { $lte: now },
    });

    for (const sub of dueSubscriptions) {
      if (now > sub.gracePeriodEndDate) {
        sub.status = SubscriptionStatus.SUSPENDED;
        await sub.save();
        await Tenant.findByIdAndUpdate(sub.tenantId, { status: TenantStatus.SUSPENDED });
        await AuditLog.create({
          tenantId: sub.tenantId,
          action: 'SUBSCRIPTION_AUTO_SUSPENDED',
          entity: 'Subscription',
          entityId: sub._id,
          newValue: { status: SubscriptionStatus.SUSPENDED },
        });
      } else {
        sub.status = SubscriptionStatus.GRACE_PERIOD;
        await sub.save();
      }
    }

    // 2. Mark grace periods that have ended into SUSPENDED
    const graceEnded = await Subscription.find({
      status: SubscriptionStatus.GRACE_PERIOD,
      gracePeriodEndDate: { $lte: now },
    });

    for (const sub of graceEnded) {
      sub.status = SubscriptionStatus.SUSPENDED;
      await sub.save();
      await Tenant.findByIdAndUpdate(sub.tenantId, { status: TenantStatus.SUSPENDED });
      await AuditLog.create({
        tenantId: sub.tenantId,
        action: 'SUBSCRIPTION_GRACE_EXPIRED_SUSPENDED',
        entity: 'Subscription',
        entityId: sub._id,
        newValue: { status: SubscriptionStatus.SUSPENDED },
      });
    }

    console.log(`[SubscriptionJob] Evaluated ${dueSubscriptions.length + graceEnded.length} subscriptions.`);
  }
}
