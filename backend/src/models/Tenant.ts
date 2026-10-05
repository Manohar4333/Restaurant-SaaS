import mongoose, { Document, Schema } from 'mongoose';
import { TenantStatus } from '../constants';

export interface ITenant extends Document {
  businessName: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logo?: string;
  currency: string;
  taxPercentage: number;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'India' },
    },
    logo: { type: String },
    currency: { type: String, default: 'INR' },
    taxPercentage: { type: Number, default: 5.0, min: 0, max: 100 },
    status: { type: String, enum: Object.values(TenantStatus), default: TenantStatus.ACTIVE },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
