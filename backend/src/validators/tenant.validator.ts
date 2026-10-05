import { z } from 'zod';
import { BillingCycle, TenantStatus } from '../constants';

export const createTenantSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default('India'),
    }).optional(),
    planId: z.string().min(1, 'Subscription plan is required'),
    rentAmount: z.number().min(0, 'Rent amount must be non-negative').optional(),
    billingCycle: z.nativeEnum(BillingCycle).default(BillingCycle.MONTHLY),
    startDate: z.string().or(z.date()).optional(),
    expiryDate: z.string().or(z.date()).optional(),
    status: z.nativeEnum(TenantStatus).default(TenantStatus.ACTIVE),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).optional(),
    logo: z.string().url().optional(),
    taxPercentage: z.number().min(0).max(100).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
});
