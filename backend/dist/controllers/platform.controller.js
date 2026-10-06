"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformController = void 0;
const tenant_service_1 = require("../services/tenant.service");
const subscription_service_1 = require("../services/subscription.service");
const payment_service_1 = require("../services/payment.service");
const report_service_1 = require("../services/report.service");
const apiResponse_1 = require("../utils/apiResponse");
const constants_1 = require("../constants");
class PlatformController {
    static async getDashboard(req, res, next) {
        try {
            const metrics = await report_service_1.ReportService.getPlatformDashboardMetrics();
            return apiResponse_1.ApiResponse.success(res, 'Dashboard metrics fetched', metrics);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTenants(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.listTenants(req.query);
            return apiResponse_1.ApiResponse.success(res, 'Tenants fetched', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async createTenant(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.createTenantWithAdmin(req.body, req.user.userId);
            return apiResponse_1.ApiResponse.created(res, 'Tenant and Admin created successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTenantById(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.getTenantById(req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Tenant details fetched', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTenant(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.updateTenant(req.params.id, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Tenant updated successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async activateTenant(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.setTenantStatus(req.params.id, constants_1.TenantStatus.ACTIVE, req.user.userId);
            return apiResponse_1.ApiResponse.success(res, 'Tenant activated successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async suspendTenant(req, res, next) {
        try {
            const result = await tenant_service_1.TenantService.setTenantStatus(req.params.id, constants_1.TenantStatus.SUSPENDED, req.user.userId);
            return apiResponse_1.ApiResponse.success(res, 'Tenant suspended successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlans(req, res, next) {
        try {
            const plans = await subscription_service_1.SubscriptionService.listPlans();
            return apiResponse_1.ApiResponse.success(res, 'Plans fetched', plans);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPlan(req, res, next) {
        try {
            const plan = await subscription_service_1.SubscriptionService.createPlan(req.body);
            return apiResponse_1.ApiResponse.created(res, 'Plan created successfully', plan);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePlan(req, res, next) {
        try {
            const plan = await subscription_service_1.SubscriptionService.updatePlan(req.params.id, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Plan updated', plan);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePlan(req, res, next) {
        try {
            await subscription_service_1.SubscriptionService.deletePlan(req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Plan deactivated');
        }
        catch (error) {
            next(error);
        }
    }
    static async getSubscriptions(req, res, next) {
        try {
            const subs = await subscription_service_1.SubscriptionService.listAllSubscriptions();
            return apiResponse_1.ApiResponse.success(res, 'Subscriptions fetched', subs);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPayments(req, res, next) {
        try {
            const payments = await payment_service_1.PaymentService.listAllPayments();
            return apiResponse_1.ApiResponse.success(res, 'Payments fetched', payments);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlatformController = PlatformController;
