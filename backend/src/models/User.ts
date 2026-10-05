import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  tenantId?: mongoose.Types.ObjectId;
  status: UserStatus;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.ADMIN },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before saving if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
