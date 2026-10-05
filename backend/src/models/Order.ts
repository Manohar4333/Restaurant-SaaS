import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, OrderPaymentStatus, OrderPaymentMethod } from '../constants';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'RestaurantTable', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(OrderPaymentMethod),
      default: OrderPaymentMethod.PAY_AT_RESTAURANT,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(OrderPaymentStatus),
      default: OrderPaymentStatus.PENDING,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEW,
      index: true,
    },
    specialInstructions: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for tenant order queries & reporting
OrderSchema.index({ tenantId: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, orderStatus: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
