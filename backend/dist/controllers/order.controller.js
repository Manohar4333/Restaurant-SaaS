"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const apiResponse_1 = require("../utils/apiResponse");
const constants_1 = require("../constants");
const errorHandler_1 = require("../middlewares/errorHandler");
class OrderController {
    static async createOrder(req, res, next) {
        try {
            const order = await order_service_1.OrderService.createOrder(req.body);
            return apiResponse_1.ApiResponse.created(res, 'Order placed successfully', order);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrderById(req, res, next) {
        try {
            const order = await order_service_1.OrderService.getOrderById(req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Order details fetched', order);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCustomerOrders(req, res, next) {
        try {
            const phone = req.query.phone;
            if (!phone) {
                return apiResponse_1.ApiResponse.badRequest(res, 'Phone number query parameter required');
            }
            const orders = await order_service_1.OrderService.getCustomerOrders(phone);
            return apiResponse_1.ApiResponse.success(res, 'Past orders fetched', orders);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelOrder(req, res, next) {
        try {
            const order = await order_service_1.OrderService.getOrderById(req.params.id);
            if (order.orderStatus !== constants_1.OrderStatus.NEW) {
                throw new errorHandler_1.AppError('Order cannot be cancelled once accepted or preparing', 400, 'CANNOT_CANCEL');
            }
            const updated = await order_service_1.OrderService.updateOrderStatus(order.tenantId.toString(), order._id.toString(), constants_1.OrderStatus.CANCELLED);
            return apiResponse_1.ApiResponse.success(res, 'Order cancelled successfully', updated);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderController = OrderController;
