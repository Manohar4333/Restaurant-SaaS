import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { SubscriptionService } from '../services/subscription.service';
import { PaymentService } from '../services/payment.service';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../utils/apiResponse';
import { TenantStatus } from '../constants';

export class PlatformController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await ReportService.getPlatformDashboardMetrics();
      return ApiResponse.success(res, 'Dashboard metrics fetched', metrics);
    } catch (error) {
      next(error);
    }
  }

  static async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.listTenants(req.query as any);
      return ApiResponse.success(res, 'Tenants fetched', result);
    } catch (error) {
      next(error);
    }
  }

  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.createTenantWithAdmin(req.body, req.user!.userId);
      return ApiResponse.created(res, 'Tenant and Admin created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.getTenantById(req.params.id);
      return ApiResponse.success(res, 'Tenant details fetched', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.updateTenant(req.params.id, req.body);
      return ApiResponse.success(res, 'Tenant updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async activateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.setTenantStatus(req.params.id, TenantStatus.ACTIVE, req.user!.userId);
      return ApiResponse.success(res, 'Tenant activated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async suspendTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.setTenantStatus(req.params.id, TenantStatus.SUSPENDED, req.user!.userId);
      return ApiResponse.success(res, 'Tenant suspended successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await SubscriptionService.listPlans();
      return ApiResponse.success(res, 'Plans fetched', plans);
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await SubscriptionService.createPlan(req.body);
      return ApiResponse.created(res, 'Plan created successfully', plan);
    } catch (error) {
      next(error);
    }
  }

  static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await SubscriptionService.updatePlan(req.params.id, req.body);
      return ApiResponse.success(res, 'Plan updated', plan);
    } catch (error) {
      next(error);
    }
  }

  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      await SubscriptionService.deletePlan(req.params.id);
      return ApiResponse.success(res, 'Plan deactivated');
    } catch (error) {
      next(error);
    }
  }

  static async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subs = await SubscriptionService.listAllSubscriptions();
      return ApiResponse.success(res, 'Subscriptions fetched', subs);
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.listAllPayments();
      return ApiResponse.success(res, 'Payments fetched', payments);
    } catch (error) {
      next(error);
    }
  }
}
