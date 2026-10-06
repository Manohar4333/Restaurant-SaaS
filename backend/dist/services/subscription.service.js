"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const errorHandler_1 = require("../middlewares/errorHandler");
class SubscriptionService {
    static async getTenantSubscription(tenantId) {
        const subscription = await models_1.Subscription.findOne({ tenantId }).populate('planId');
        if (!subscription)
            throw new errorHandler_1.AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
        return subscription;
    }
    static async listPlans() {
        return models_1.SubscriptionPlan.find({ status: 'ACTIVE' }).sort({ price: 1 });
    }
    static async createPlan(data) {
        return models_1.SubscriptionPlan.create(data);
    }
    static async updatePlan(planId, data) {
        const plan = await models_1.SubscriptionPlan.findByIdAndUpdate(planId, { $set: data }, { new: true });
        if (!plan)
            throw new errorHandler_1.AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
        return plan;
    }
    static async deletePlan(planId) {
        const plan = await models_1.SubscriptionPlan.findByIdAndUpdate(planId, { status: 'INACTIVE' }, { new: true });
        if (!plan)
            throw new errorHandler_1.AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
        return true;
    }
    static async listAllSubscriptions() {
        return models_1.Subscription.find()
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
        const dueSubscriptions = await models_1.Subscription.find({
            status: constants_1.SubscriptionStatus.ACTIVE,
            expiryDate: { $lte: now },
        });
        for (const sub of dueSubscriptions) {
            if (now > sub.gracePeriodEndDate) {
                sub.status = constants_1.SubscriptionStatus.SUSPENDED;
                await sub.save();
                await models_1.Tenant.findByIdAndUpdate(sub.tenantId, { status: constants_1.TenantStatus.SUSPENDED });
                await models_1.AuditLog.create({
                    tenantId: sub.tenantId,
                    action: 'SUBSCRIPTION_AUTO_SUSPENDED',
                    entity: 'Subscription',
                    entityId: sub._id,
                    newValue: { status: constants_1.SubscriptionStatus.SUSPENDED },
                });
            }
            else {
                sub.status = constants_1.SubscriptionStatus.GRACE_PERIOD;
                await sub.save();
            }
        }
        // 2. Mark grace periods that have ended into SUSPENDED
        const graceEnded = await models_1.Subscription.find({
            status: constants_1.SubscriptionStatus.GRACE_PERIOD,
            gracePeriodEndDate: { $lte: now },
        });
        for (const sub of graceEnded) {
            sub.status = constants_1.SubscriptionStatus.SUSPENDED;
            await sub.save();
            await models_1.Tenant.findByIdAndUpdate(sub.tenantId, { status: constants_1.TenantStatus.SUSPENDED });
            await models_1.AuditLog.create({
                tenantId: sub.tenantId,
                action: 'SUBSCRIPTION_GRACE_EXPIRED_SUSPENDED',
                entity: 'Subscription',
                entityId: sub._id,
                newValue: { status: constants_1.SubscriptionStatus.SUSPENDED },
            });
        }
        console.log(`[SubscriptionJob] Evaluated ${dueSubscriptions.length + graceEnded.length} subscriptions.`);
    }
}
exports.SubscriptionService = SubscriptionService;
