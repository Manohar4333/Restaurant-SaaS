import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for tenant-scoped uniqueness / sorting
CategorySchema.index({ tenantId: 1, name: 1 });
CategorySchema.index({ tenantId: 1, sortOrder: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
