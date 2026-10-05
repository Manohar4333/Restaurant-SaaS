import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { TableService } from '../services/table.service';
import { OrderService } from '../services/order.service';
import { SubscriptionService } from '../services/subscription.service';
import { PaymentService } from '../services/payment.service';
import { ReportService } from '../services/report.service';
import { Tenant, Customer } from '../models';
import { ApiResponse } from '../utils/apiResponse';

export class AdminController {
  // Dashboard & Reports
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getAdminDashboardMetrics(req.tenantId!);
      return ApiResponse.success(res, 'Dashboard metrics fetched', data);
    } catch (error) {
      next(error);
    }
  }

  static async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getAdminSalesReport(req.tenantId!);
      return ApiResponse.success(res, 'Sales report fetched', data);
    } catch (error) {
      next(error);
    }
  }

  // Categories
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategories(req.tenantId!, req.query.status as string);
      return ApiResponse.success(res, 'Categories fetched', categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.tenantId!, req.body);
      return ApiResponse.created(res, 'Category created', category);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.updateCategory(req.tenantId!, req.params.id, req.body);
      return ApiResponse.success(res, 'Category updated', category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(req.tenantId!, req.params.id);
      return ApiResponse.success(res, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }

  // Products
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProducts(req.tenantId!, req.query as any);
      return ApiResponse.success(res, 'Products fetched', result);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.tenantId!, req.body);
      return ApiResponse.created(res, 'Product created', product);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.tenantId!, req.params.id);
      return ApiResponse.success(res, 'Product fetched', product);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.tenantId!, req.params.id, req.body);
      return ApiResponse.success(res, 'Product updated', product);
    } catch (error) {
      next(error);
    }
  }

  static async toggleProductAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.toggleAvailability(req.tenantId!, req.params.id, req.body.availability);
      return ApiResponse.success(res, 'Product availability updated', product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.deleteProduct(req.tenantId!, req.params.id);
      return ApiResponse.success(res, 'Product deleted');
    } catch (error) {
      next(error);
    }
  }

  // Tables
  static async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      const tables = await TableService.getTables(req.tenantId!);
      return ApiResponse.success(res, 'Tables fetched', tables);
    } catch (error) {
      next(error);
    }
  }

  static async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await TableService.createTable(req.tenantId!, req.body);
      return ApiResponse.created(res, 'Table created', table);
    } catch (error) {
      next(error);
    }
  }

  static async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await TableService.updateTable(req.tenantId!, req.params.id, req.body);
      return ApiResponse.success(res, 'Table updated', table);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      await TableService.deleteTable(req.tenantId!, req.params.id);
      return ApiResponse.success(res, 'Table deleted');
    } catch (error) {
      next(error);
    }
  }

  static async getTableQR(req: Request, res: Response, next: NextFunction) {
    try {
      const qrData = await TableService.getTableQR(req.tenantId!, req.params.id);
      return ApiResponse.success(res, 'QR data fetched', qrData);
    } catch (error) {
      next(error);
    }
  }

  // Orders
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getOrders(req.tenantId!, req.query as any);
      return ApiResponse.success(res, 'Orders fetched', orders);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.params.id, req.tenantId!);
      return ApiResponse.success(res, 'Order fetched', order);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.updateOrderStatus(req.tenantId!, req.params.id, req.body.status);
      return ApiResponse.success(res, 'Order status updated', order);
    } catch (error) {
      next(error);
    }
  }

  // Customers
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await Customer.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
      return ApiResponse.success(res, 'Customers fetched', customers);
    } catch (error) {
      next(error);
    }
  }

  // Subscription & Payments
  static async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.getTenantSubscription(req.tenantId!);
      return ApiResponse.success(res, 'Subscription details fetched', subscription);
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.listTenantPayments(req.tenantId!);
      return ApiResponse.success(res, 'Payments fetched', payments);
    } catch (error) {
      next(error);
    }
  }

  static async createSubscriptionPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.createSubscriptionOrder(req.tenantId!, req.body.planId);
      return ApiResponse.success(res, 'Payment order created', result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyPayment(req.tenantId!, req.body);
      return ApiResponse.success(res, 'Payment verified successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // Profile
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findById(req.tenantId);
      return ApiResponse.success(res, 'Profile fetched', tenant);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { $set: req.body }, { new: true });
      return ApiResponse.success(res, 'Profile updated', tenant);
    } catch (error) {
      next(error);
    }
  }
}
