import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../constants';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceType: { type: String },
    referenceId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // 30 days TTL
  }
);

NotificationSchema.index({ tenantId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
