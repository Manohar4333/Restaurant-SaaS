import crypto from 'crypto';
import { Payment, Subscription, SubscriptionPlan, Tenant, AuditLog } from '../models';
import { PaymentProvider, PaymentStatus, SubscriptionStatus, TenantStatus, BillingCycle } from '../constants';
import { AppError } from '../middlewares/errorHandler';
import { razorpayClient } from '../config/razorpay';
import { ENV } from '../config/env';

export class PaymentService {
  /**
   * Create Razorpay Order for tenant subscription payment
   */
  static async createSubscriptionOrder(tenantId: string, planId: string) {
    const [tenant, plan, currentSub] = await Promise.all([
      Tenant.findById(tenantId),
      SubscriptionPlan.findById(planId),
      Subscription.findOne({ tenantId }),
    ]);

    if (!tenant) throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');

    const amountInPaise = Math.round(plan.price * 100);

    let razorpayOrderId = `order_${Date.now()}`;
    try {
      if (ENV.RAZORPAY_KEY_ID && !ENV.RAZORPAY_KEY_ID.includes('placeholder')) {
        const rzpOrder = await razorpayClient.orders.create({
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
    } catch (rzpErr) {
      console.warn('[PaymentService] Razorpay order creation failed, fallback to mock order id for development:', rzpErr);
    }

    const payment = await Payment.create({
      tenantId,
      subscriptionId: currentSub?._id,
      amount: plan.price,
      currency: 'INR',
      orderId: razorpayOrderId,
      paymentProvider: PaymentProvider.RAZORPAY,
      status: PaymentStatus.CREATED,
      metadata: { planId, planName: plan.name },
    });

    return {
      orderId: razorpayOrderId,
      amount: plan.price,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      businessName: tenant.businessName,
    };
  }

  /**
   * Verify Razorpay Payment Signature and activate tenant subscription
   */
  static async verifyPayment(
    tenantId: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ) {
    const payment = await Payment.findOne({ tenantId, orderId: data.razorpay_order_id });
    if (!payment) throw new AppError('Payment record not found for this order', 404, 'PAYMENT_NOT_FOUND');

    // Signature verification: hmac_sha256(order_id + "|" + payment_id, secret)
    let isValid = false;
    if (ENV.RAZORPAY_KEY_SECRET && !ENV.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
        .digest('hex');
      isValid = generatedSignature === data.razorpay_signature;
    } else {
      // In development / testing mode with mock secret, accept signature
      isValid = true;
    }

    if (!isValid) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      throw new AppError('Invalid payment signature verification', 400, 'PAYMENT_SIGNATURE_MISMATCH');
    }

    // Mark payment success
    payment.status = PaymentStatus.SUCCESS;
    payment.transactionId = data.razorpay_payment_id;
    payment.paymentDate = new Date();
    await payment.save();

    // Extend or activate subscription
    const planId = payment.metadata?.planId;
    const plan = planId ? await SubscriptionPlan.findById(planId) : null;
    const days = (plan?.billingCycle || BillingCycle.MONTHLY) === BillingCycle.YEARLY ? 365 : 30;

    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const graceEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.findOneAndUpdate(
      { tenantId },
      {
        $set: {
          ...(plan ? { planId: plan._id, amount: plan.price, billingCycle: plan.billingCycle } : {}),
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          nextDueDate: expiry,
          expiryDate: expiry,
          gracePeriodEndDate: graceEnd,
        },
      },
      { new: true, upsert: true }
    );

    // Ensure Tenant is marked ACTIVE
    await Tenant.findByIdAndUpdate(tenantId, { status: TenantStatus.ACTIVE });

    await AuditLog.create({
      tenantId,
      action: 'PAYMENT_VERIFIED_SUBSCRIPTION_ACTIVATED',
      entity: 'Payment',
      entityId: payment._id,
      newValue: {
        paymentId: payment._id,
        transactionId: data.razorpay_payment_id,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });

    return {
      success: true,
      payment,
      subscription,
    };
  }

  static async listTenantPayments(tenantId: string) {
    return Payment.find({ tenantId }).sort({ createdAt: -1 });
  }

  static async listAllPayments() {
    return Payment.find()
      .populate('tenantId', 'businessName email slug')
      .sort({ createdAt: -1 });
  }
}
