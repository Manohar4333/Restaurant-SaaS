import jwt from 'jsonwebtoken';
import { User, Tenant, Subscription } from '../models';
import { ENV } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import { JwtUserPayload } from '../types/express';
import { UserRole } from '../constants';

export class AuthService {
  static generateTokens(payload: JwtUserPayload) {
    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError('Account is suspended. Please contact platform support.', 403, 'ACCOUNT_SUSPENDED');
    }

    const payload: JwtUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ? user.tenantId.toString() : undefined,
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);
    user.refreshToken = refreshToken;
    await user.save();

    let tenant = null;
    let subscription = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
      subscription = await Subscription.findOne({ tenantId: user.tenantId }).populate('planId');
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        status: user.status,
      },
      tenant: tenant ? {
        id: tenant._id,
        businessName: tenant.businessName,
        slug: tenant.slug,
        status: tenant.status,
        currency: tenant.currency,
        taxPercentage: tenant.taxPercentage,
        logo: tenant.logo,
      } : null,
      subscription: subscription ? {
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        gracePeriodEndDate: subscription.gracePeriodEndDate,
        plan: subscription.planId,
      } : null,
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = jwt.verify(oldRefreshToken, ENV.JWT_REFRESH_SECRET) as JwtUserPayload;
      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user || user.refreshToken !== oldRefreshToken) {
        throw new AppError('Invalid or reused refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const payload: JwtUserPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ? user.tenantId.toString() : undefined,
      };

      const tokens = this.generateTokens(payload);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (err: any) {
      throw new AppError('Refresh token expired or invalid', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    return true;
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    let tenant = null;
    let subscription = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
      subscription = await Subscription.findOne({ tenantId: user.tenantId }).populate('planId');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        status: user.status,
      },
      tenant: tenant ? {
        id: tenant._id,
        businessName: tenant.businessName,
        slug: tenant.slug,
        status: tenant.status,
        currency: tenant.currency,
        taxPercentage: tenant.taxPercentage,
        logo: tenant.logo,
      } : null,
      subscription: subscription ? {
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        gracePeriodEndDate: subscription.gracePeriodEndDate,
        plan: subscription.planId,
      } : null,
    };
  }
}
