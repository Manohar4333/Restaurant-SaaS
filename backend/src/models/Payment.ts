import mongoose, { Document, Schema } from 'mongoose';
import { PaymentProvider, PaymentStatus } from '../constants';

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  transactionId?: string;
  orderId?: string;
  paymentProvider: PaymentProvider;
  paymentMethod?: string;
  paymentDate: Date;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    transactionId: { type: String, sparse: true },
    orderId: { type: String },
    paymentProvider: { type: String, enum: Object.values(PaymentProvider), default: PaymentProvider.RAZORPAY },
    paymentMethod: { type: String, default: 'ONLINE' },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.CREATED },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Compound index for tenant payment history lookup
PaymentSchema.index({ tenantId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
