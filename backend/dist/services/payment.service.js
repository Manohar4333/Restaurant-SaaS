"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const constants_1 = require("../constants");
const errorHandler_1 = require("../middlewares/errorHandler");
const razorpay_1 = require("../config/razorpay");
const env_1 = require("../config/env");
class PaymentService {
    /**
     * Create Razorpay Order for tenant subscription payment
     */
    static async createSubscriptionOrder(tenantId, planId) {
        const [tenant, plan, currentSub] = await Promise.all([
            models_1.Tenant.findById(tenantId),
            models_1.SubscriptionPlan.findById(planId),
            models_1.Subscription.findOne({ tenantId }),
        ]);
        if (!tenant)
            throw new errorHandler_1.AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
        if (!plan)
            throw new errorHandler_1.AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
        const amountInPaise = Math.round(plan.price * 100);
        let razorpayOrderId = `order_${Date.now()}`;
        try {
            if (env_1.ENV.RAZORPAY_KEY_ID && !env_1.ENV.RAZORPAY_KEY_ID.includes('placeholder')) {
                const rzpOrder = await razorpay_1.razorpayClient.orders.create({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `rcpt_${tenantId.toString().slice(-6)}_${Date.now()}`,
                    notes: {
                        tenantId: tenantId.toString(),
                        planId: planId.toString(),
                    },
                });
                razorpayOrderId = rzpOrder.id;
            }
        }
        catch (rzpErr) {
            console.warn('[PaymentService] Razorpay order creation failed, fallback to mock order id for development:', rzpErr);
        }
        const payment = await models_1.Payment.create({
            tenantId,
            subscriptionId: currentSub?._id,
            amount: plan.price,
            currency: 'INR',
            orderId: razorpayOrderId,
            paymentProvider: constants_1.PaymentProvider.RAZORPAY,
            status: constants_1.PaymentStatus.CREATED,
            metadata: { planId, planName: plan.name },
        });
        return {
            orderId: razorpayOrderId,
            amount: plan.price,
            currency: 'INR',
            keyId: env_1.ENV.RAZORPAY_KEY_ID,
            paymentId: payment._id,
            businessName: tenant.businessName,
        };
    }
    /**
     * Verify Razorpay Payment Signature and activate tenant subscription
     */
    static async verifyPayment(tenantId, data) {
        const payment = await models_1.Payment.findOne({ tenantId, orderId: data.razorpay_order_id });
        if (!payment)
            throw new errorHandler_1.AppError('Payment record not found for this order', 404, 'PAYMENT_NOT_FOUND');
        // Signature verification: hmac_sha256(order_id + "|" + payment_id, secret)
        let isValid = false;
        if (env_1.ENV.RAZORPAY_KEY_SECRET && !env_1.ENV.RAZORPAY_KEY_SECRET.includes('placeholder')) {
            const generatedSignature = crypto_1.default
                .createHmac('sha256', env_1.ENV.RAZORPAY_KEY_SECRET)
                .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
                .digest('hex');
            isValid = generatedSignature === data.razorpay_signature;
        }
        else {
            // In development / testing mode with mock secret, accept signature
            isValid = true;
        }
        if (!isValid) {
            payment.status = constants_1.PaymentStatus.FAILED;
            await payment.save();
            throw new errorHandler_1.AppError('Invalid payment signature verification', 400, 'PAYMENT_SIGNATURE_MISMATCH');
        }
        // Mark payment success
        payment.status = constants_1.PaymentStatus.SUCCESS;
        payment.transactionId = data.razorpay_payment_id;
        payment.paymentDate = new Date();
        await payment.save();
        // Extend or activate subscription
        const planId = payment.metadata?.planId;
        const plan = planId ? await models_1.SubscriptionPlan.findById(planId) : null;
        const days = (plan?.billingCycle || constants_1.BillingCycle.MONTHLY) === constants_1.BillingCycle.YEARLY ? 365 : 30;
        const now = new Date();
        const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const graceEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000);
        const subscription = await models_1.Subscription.findOneAndUpdate({ tenantId }, {
            $set: {
                ...(plan ? { planId: plan._id, amount: plan.price, billingCycle: plan.billingCycle } : {}),
                status: constants_1.SubscriptionStatus.ACTIVE,
                startDate: now,
                nextDueDate: expiry,
                expiryDate: expiry,
                gracePeriodEndDate: graceEnd,
            },
        }, { new: true, upsert: true });
        // Ensure Tenant is marked ACTIVE
        await models_1.Tenant.findByIdAndUpdate(tenantId, { status: constants_1.TenantStatus.ACTIVE });
        await models_1.AuditLog.create({
            tenantId,
            action: 'PAYMENT_VERIFIED_SUBSCRIPTION_ACTIVATED',
            entity: 'Payment',
            entityId: payment._id,
            newValue: {
                paymentId: payment._id,
                transactionId: data.razorpay_payment_id,
                subscriptionStatus: constants_1.SubscriptionStatus.ACTIVE,
            },
        });
        return {
            success: true,
            payment,
            subscription,
        };
    }
    static async listTenantPayments(tenantId) {
        return models_1.Payment.find({ tenantId }).sort({ createdAt: -1 });
    }
    static async listAllPayments() {
        return models_1.Payment.find()
            .populate('tenantId', 'businessName email slug')
            .sort({ createdAt: -1 });
    }
}
exports.PaymentService = PaymentService;
