import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    isGuest: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index customer by tenant and phone
CustomerSchema.index({ tenantId: 1, phone: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
