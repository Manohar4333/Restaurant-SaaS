"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middlewares/errorHandler");
class AuthService {
    static generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_ACCESS_SECRET, {
            expiresIn: env_1.ENV.JWT_ACCESS_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_REFRESH_SECRET, {
            expiresIn: env_1.ENV.JWT_REFRESH_EXPIRES_IN,
        });
        return { accessToken, refreshToken };
    }
    static async login(email, password) {
        const user = await models_1.User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
        if (!user) {
            throw new errorHandler_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errorHandler_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        if (user.status === 'SUSPENDED') {
            throw new errorHandler_1.AppError('Account is suspended. Please contact platform support.', 403, 'ACCOUNT_SUSPENDED');
        }
        const payload = {
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
            tenant = await models_1.Tenant.findById(user.tenantId);
            subscription = await models_1.Subscription.findOne({ tenantId: user.tenantId }).populate('planId');
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
    static async refreshToken(oldRefreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, env_1.ENV.JWT_REFRESH_SECRET);
            const user = await models_1.User.findById(decoded.userId).select('+refreshToken');
            if (!user || user.refreshToken !== oldRefreshToken) {
                throw new errorHandler_1.AppError('Invalid or reused refresh token', 401, 'INVALID_REFRESH_TOKEN');
            }
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                tenantId: user.tenantId ? user.tenantId.toString() : undefined,
            };
            const tokens = this.generateTokens(payload);
            user.refreshToken = tokens.refreshToken;
            await user.save();
            return tokens;
        }
        catch (err) {
            throw new errorHandler_1.AppError('Refresh token expired or invalid', 401, 'INVALID_REFRESH_TOKEN');
        }
    }
    static async logout(userId) {
        await models_1.User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
        return true;
    }
    static async getCurrentUser(userId) {
        const user = await models_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        let tenant = null;
        let subscription = null;
        if (user.tenantId) {
            tenant = await models_1.Tenant.findById(user.tenantId);
            subscription = await models_1.Subscription.findOne({ tenantId: user.tenantId }).populate('planId');
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
exports.AuthService = AuthService;
