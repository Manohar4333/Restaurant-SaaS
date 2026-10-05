import mongoose, { Document, Schema } from 'mongoose';
import { BillingCycle } from '../constants';

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  maxTables?: number;
  maxProducts?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    billingCycle: { type: String, enum: Object.values(BillingCycle), default: BillingCycle.MONTHLY },
    features: [{ type: String }],
    maxTables: { type: Number, default: 50 },
    maxProducts: { type: Number, default: 200 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
