"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const category_service_1 = require("../services/category.service");
const product_service_1 = require("../services/product.service");
const table_service_1 = require("../services/table.service");
const order_service_1 = require("../services/order.service");
const subscription_service_1 = require("../services/subscription.service");
const payment_service_1 = require("../services/payment.service");
const report_service_1 = require("../services/report.service");
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
class AdminController {
    // Dashboard & Reports
    static async getDashboard(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getAdminDashboardMetrics(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Dashboard metrics fetched', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSalesReport(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getAdminSalesReport(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Sales report fetched', data);
        }
        catch (error) {
            next(error);
        }
    }
    // Categories
    static async getCategories(req, res, next) {
        try {
            const categories = await category_service_1.CategoryService.getCategories(req.tenantId, req.query.status);
            return apiResponse_1.ApiResponse.success(res, 'Categories fetched', categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async createCategory(req, res, next) {
        try {
            const category = await category_service_1.CategoryService.createCategory(req.tenantId, req.body);
            return apiResponse_1.ApiResponse.created(res, 'Category created', category);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const category = await category_service_1.CategoryService.updateCategory(req.tenantId, req.params.id, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Category updated', category);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCategory(req, res, next) {
        try {
            await category_service_1.CategoryService.deleteCategory(req.tenantId, req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Category deleted');
        }
        catch (error) {
            next(error);
        }
    }
    // Products
    static async getProducts(req, res, next) {
        try {
            const result = await product_service_1.ProductService.getProducts(req.tenantId, req.query);
            return apiResponse_1.ApiResponse.success(res, 'Products fetched', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async createProduct(req, res, next) {
        try {
            const product = await product_service_1.ProductService.createProduct(req.tenantId, req.body);
            return apiResponse_1.ApiResponse.created(res, 'Product created', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductById(req, res, next) {
        try {
            const product = await product_service_1.ProductService.getProductById(req.tenantId, req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Product fetched', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProduct(req, res, next) {
        try {
            const product = await product_service_1.ProductService.updateProduct(req.tenantId, req.params.id, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Product updated', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleProductAvailability(req, res, next) {
        try {
            const product = await product_service_1.ProductService.toggleAvailability(req.tenantId, req.params.id, req.body.availability);
            return apiResponse_1.ApiResponse.success(res, 'Product availability updated', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteProduct(req, res, next) {
        try {
            await product_service_1.ProductService.deleteProduct(req.tenantId, req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Product deleted');
        }
        catch (error) {
            next(error);
        }
    }
    // Tables
    static async getTables(req, res, next) {
        try {
            const tables = await table_service_1.TableService.getTables(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Tables fetched', tables);
        }
        catch (error) {
            next(error);
        }
    }
    static async createTable(req, res, next) {
        try {
            const table = await table_service_1.TableService.createTable(req.tenantId, req.body);
            return apiResponse_1.ApiResponse.created(res, 'Table created', table);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTable(req, res, next) {
        try {
            const table = await table_service_1.TableService.updateTable(req.tenantId, req.params.id, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Table updated', table);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTable(req, res, next) {
        try {
            await table_service_1.TableService.deleteTable(req.tenantId, req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'Table deleted');
        }
        catch (error) {
            next(error);
        }
    }
    static async getTableQR(req, res, next) {
        try {
            const qrData = await table_service_1.TableService.getTableQR(req.tenantId, req.params.id);
            return apiResponse_1.ApiResponse.success(res, 'QR data fetched', qrData);
        }
        catch (error) {
            next(error);
        }
    }
    // Orders
    static async getOrders(req, res, next) {
        try {
            const orders = await order_service_1.OrderService.getOrders(req.tenantId, req.query);
            return apiResponse_1.ApiResponse.success(res, 'Orders fetched', orders);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrderById(req, res, next) {
        try {
            const order = await order_service_1.OrderService.getOrderById(req.params.id, req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Order fetched', order);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOrderStatus(req, res, next) {
        try {
            const order = await order_service_1.OrderService.updateOrderStatus(req.tenantId, req.params.id, req.body.status);
            return apiResponse_1.ApiResponse.success(res, 'Order status updated', order);
        }
        catch (error) {
            next(error);
        }
    }
    // Customers
    static async getCustomers(req, res, next) {
        try {
            const customers = await models_1.Customer.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
            return apiResponse_1.ApiResponse.success(res, 'Customers fetched', customers);
        }
        catch (error) {
            next(error);
        }
    }
    // Subscription & Payments
    static async getSubscription(req, res, next) {
        try {
            const subscription = await subscription_service_1.SubscriptionService.getTenantSubscription(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Subscription details fetched', subscription);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPayments(req, res, next) {
        try {
            const payments = await payment_service_1.PaymentService.listTenantPayments(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Payments fetched', payments);
        }
        catch (error) {
            next(error);
        }
    }
    static async createSubscriptionPayment(req, res, next) {
        try {
            const result = await payment_service_1.PaymentService.createSubscriptionOrder(req.tenantId, req.body.planId);
            return apiResponse_1.ApiResponse.success(res, 'Payment order created', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyPayment(req, res, next) {
        try {
            const result = await payment_service_1.PaymentService.verifyPayment(req.tenantId, req.body);
            return apiResponse_1.ApiResponse.success(res, 'Payment verified successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    // Profile
    static async getProfile(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findById(req.tenantId);
            return apiResponse_1.ApiResponse.success(res, 'Profile fetched', tenant);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findByIdAndUpdate(req.tenantId, { $set: req.body }, { new: true });
            return apiResponse_1.ApiResponse.success(res, 'Profile updated', tenant);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
