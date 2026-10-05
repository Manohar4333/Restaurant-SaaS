import mongoose, { Document, Schema } from 'mongoose';
import { TableStatus } from '../constants';
import crypto from 'crypto';

export interface IRestaurantTable extends Document {
  tenantId: mongoose.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: TableStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantTableSchema = new Schema<IRestaurantTable>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    tableNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, default: 4 },
    qrToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TableStatus),
      default: TableStatus.AVAILABLE,
    },
  },
  { timestamps: true }
);

// Unique table number per tenant
RestaurantTableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });

export const RestaurantTable = mongoose.model<IRestaurantTable>('RestaurantTable', RestaurantTableSchema);
