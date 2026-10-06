"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentSchema = exports.createSubscriptionPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createSubscriptionPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().min(1, 'Plan ID is required'),
    }),
});
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        razorpay_order_id: zod_1.z.string().min(1, 'Order ID is required'),
        razorpay_payment_id: zod_1.z.string().min(1, 'Payment ID is required'),
        razorpay_signature: zod_1.z.string().min(1, 'Signature is required'),
    }),
});
