"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveSubscription = requireActiveSubscription;
const constants_1 = require("../constants");
const apiResponse_1 = require("../utils/apiResponse");
const mongoose_1 = __importDefault(require("mongoose"));
async function requireActiveSubscription(req, res, next) {
    // Super Admins bypass subscription checks
    if (req.user?.role === constants_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    // Customers do not have subscription checks
    if (req.user?.role === constants_1.UserRole.CUSTOMER) {
        return next();
    }
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
        return apiResponse_1.ApiResponse.forbidden(res, 'Tenant context missing', 'TENANT_REQUIRED');
    }
    try {
        const Subscription = mongoose_1.default.model('Subscription');
        const subscription = await Subscription.findOne({ tenantId });
        if (!subscription) {
            return apiResponse_1.ApiResponse.error(res, 'No active subscription found for this business. Please subscribe to a plan.', 'NO_SUBSCRIPTION', 402);
        }
        const allowedStatuses = [constants_1.SubscriptionStatus.ACTIVE, constants_1.SubscriptionStatus.GRACE_PERIOD];
        if (!allowedStatuses.includes(subscription.status)) {
            return apiResponse_1.ApiResponse.error(res, `Your subscription is currently ${subscription.status}. Please make a payment to restore access.`, 'SUBSCRIPTION_SUSPENDED', 402, {
                subscriptionStatus: subscription.status,
                expiryDate: subscription.expiryDate,
                gracePeriodEndDate: subscription.gracePeriodEndDate,
            });
        }
        next();
    }
    catch (error) {
        // If Subscription model is not registered yet or DB is initializing, continue gracefully in early phase
        next();
    }
}
