"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantSchema = exports.createTenantSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.createTenantSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2, 'Business name is required'),
        ownerName: zod_1.z.string().min(2, 'Owner name is required'),
        email: zod_1.z.string().email('Valid email is required'),
        phone: zod_1.z.string().min(6, 'Valid phone number is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        address: zod_1.z.object({
            street: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().default('India'),
        }).optional(),
        planId: zod_1.z.string().min(1, 'Subscription plan is required'),
        rentAmount: zod_1.z.number().min(0, 'Rent amount must be non-negative').optional(),
        billingCycle: zod_1.z.nativeEnum(constants_1.BillingCycle).default(constants_1.BillingCycle.MONTHLY),
        startDate: zod_1.z.string().or(zod_1.z.date()).optional(),
        expiryDate: zod_1.z.string().or(zod_1.z.date()).optional(),
        status: zod_1.z.nativeEnum(constants_1.TenantStatus).default(constants_1.TenantStatus.ACTIVE),
    }),
});
exports.updateTenantSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().min(6).optional(),
        logo: zod_1.z.string().url().optional(),
        taxPercentage: zod_1.z.number().min(0).max(100).optional(),
        address: zod_1.z.object({
            street: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
        }).optional(),
    }),
});
