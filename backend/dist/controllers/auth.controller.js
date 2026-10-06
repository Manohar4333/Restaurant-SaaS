"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login(email, password);
            // Set HTTP-only secure cookie for refresh token
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return apiResponse_1.ApiResponse.success(res, 'Login successful', {
                accessToken: result.accessToken,
                user: result.user,
                tenant: result.tenant,
                subscription: result.subscription,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!token) {
                return apiResponse_1.ApiResponse.unauthorized(res, 'Refresh token required');
            }
            const tokens = await auth_service_1.AuthService.refreshToken(token);
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return apiResponse_1.ApiResponse.success(res, 'Token refreshed', {
                accessToken: tokens.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            if (req.user?.userId) {
                await auth_service_1.AuthService.logout(req.user.userId);
            }
            res.clearCookie('refreshToken');
            return apiResponse_1.ApiResponse.success(res, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            if (!req.user?.userId) {
                return apiResponse_1.ApiResponse.unauthorized(res);
            }
            const data = await auth_service_1.AuthService.getCurrentUser(req.user.userId);
            return apiResponse_1.ApiResponse.success(res, 'Profile fetched', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
