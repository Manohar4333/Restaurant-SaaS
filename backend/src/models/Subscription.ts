import mongoose, { Document, Schema } from 'mongoose';
import { BillingCycle, SubscriptionStatus } from '../constants';

export interface ISubscription extends Document {
  tenantId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  amount: number;
  billingCycle: BillingCycle;
  startDate: Date;
  nextDueDate: Date;
  expiryDate: Date;
  gracePeriodEndDate: Date;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    amount: { type: Number, required: true, min: 0 },
    billingCycle: { type: String, enum: Object.values(BillingCycle), default: BillingCycle.MONTHLY },
    startDate: { type: Date, default: Date.now },
    nextDueDate: { type: Date, required: true, index: true },
    expiryDate: { type: Date, required: true, index: true },
    gracePeriodEndDate: { type: Date, required: true, index: true },
    status: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.ACTIVE },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
