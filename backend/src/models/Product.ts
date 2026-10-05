import mongoose, { Document, Schema } from 'mongoose';
import { ProductAvailability } from '../constants';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock: number; // -1 for unlimited
  availability: ProductAvailability;
  status: 'ACTIVE' | 'INACTIVE';
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    stock: { type: Number, default: -1 },
    availability: {
      type: String,
      enum: Object.values(ProductAvailability),
      default: ProductAvailability.AVAILABLE,
      index: true,
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for tenant queries
ProductSchema.index({ tenantId: 1, categoryId: 1 });
ProductSchema.index({ tenantId: 1, name: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
