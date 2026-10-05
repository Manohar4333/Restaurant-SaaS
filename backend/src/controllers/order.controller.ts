import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/apiResponse';
import { OrderStatus } from '../constants';
import { AppError } from '../middlewares/errorHandler';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder(req.body);
      return ApiResponse.created(res, 'Order placed successfully', order);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      return ApiResponse.success(res, 'Order details fetched', order);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        return ApiResponse.badRequest(res, 'Phone number query parameter required');
      }
      const orders = await OrderService.getCustomerOrders(phone);
      return ApiResponse.success(res, 'Past orders fetched', orders);
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (order.orderStatus !== OrderStatus.NEW) {
        throw new AppError('Order cannot be cancelled once accepted or preparing', 400, 'CANNOT_CANCEL');
      }
      const updated = await OrderService.updateOrderStatus(order.tenantId.toString(), order._id.toString(), OrderStatus.CANCELLED);
      return ApiResponse.success(res, 'Order cancelled successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}
