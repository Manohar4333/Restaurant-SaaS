"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizeRole_1 = require("../middlewares/authorizeRole");
const requireTenant_1 = require("../middlewares/requireTenant");
const requireActiveSubscription_1 = require("../middlewares/requireActiveSubscription");
const constants_1 = require("../constants");
const validateRequest_1 = require("../middlewares/validateRequest");
const category_validator_1 = require("../validators/category.validator");
const product_validator_1 = require("../validators/product.validator");
const table_validator_1 = require("../validators/table.validator");
const order_validator_1 = require("../validators/order.validator");
const payment_validator_1 = require("../validators/payment.validator");
const router = (0, express_1.Router)();
// Base middleware for all admin endpoints: must be authenticated ADMIN belonging to a tenant
router.use(authenticate_1.authenticate, (0, authorizeRole_1.authorizeRole)(constants_1.UserRole.ADMIN), requireTenant_1.requireTenant);
// Subscription & Payments (Accessible even when suspended so admin can pay!)
router.get('/subscription', admin_controller_1.AdminController.getSubscription);
router.get('/payments', admin_controller_1.AdminController.getPayments);
router.post('/subscription/create-payment', (0, validateRequest_1.validateRequest)(payment_validator_1.createSubscriptionPaymentSchema), admin_controller_1.AdminController.createSubscriptionPayment);
router.post('/subscription/verify-payment', (0, validateRequest_1.validateRequest)(payment_validator_1.verifyPaymentSchema), admin_controller_1.AdminController.verifyPayment);
// All routes below require ACTIVE subscription status
router.use(requireActiveSubscription_1.requireActiveSubscription);
// Dashboard & Reports
router.get('/dashboard', admin_controller_1.AdminController.getDashboard);
router.get('/reports/sales', admin_controller_1.AdminController.getSalesReport);
// Categories
router.get('/categories', admin_controller_1.AdminController.getCategories);
router.post('/categories', (0, validateRequest_1.validateRequest)(category_validator_1.createCategorySchema), admin_controller_1.AdminController.createCategory);
router.put('/categories/:id', (0, validateRequest_1.validateRequest)(category_validator_1.updateCategorySchema), admin_controller_1.AdminController.updateCategory);
router.delete('/categories/:id', admin_controller_1.AdminController.deleteCategory);
// Products
router.get('/products', admin_controller_1.AdminController.getProducts);
router.post('/products', (0, validateRequest_1.validateRequest)(product_validator_1.createProductSchema), admin_controller_1.AdminController.createProduct);
router.get('/products/:id', admin_controller_1.AdminController.getProductById);
router.put('/products/:id', (0, validateRequest_1.validateRequest)(product_validator_1.updateProductSchema), admin_controller_1.AdminController.updateProduct);
router.patch('/products/:id/availability', admin_controller_1.AdminController.toggleProductAvailability);
router.delete('/products/:id', admin_controller_1.AdminController.deleteProduct);
// Tables
router.get('/tables', admin_controller_1.AdminController.getTables);
router.post('/tables', (0, validateRequest_1.validateRequest)(table_validator_1.createTableSchema), admin_controller_1.AdminController.createTable);
router.put('/tables/:id', (0, validateRequest_1.validateRequest)(table_validator_1.updateTableSchema), admin_controller_1.AdminController.updateTable);
router.delete('/tables/:id', admin_controller_1.AdminController.deleteTable);
router.get('/tables/:id/qr', admin_controller_1.AdminController.getTableQR);
// Orders
router.get('/orders', admin_controller_1.AdminController.getOrders);
router.get('/orders/:id', admin_controller_1.AdminController.getOrderById);
router.patch('/orders/:id/status', (0, validateRequest_1.validateRequest)(order_validator_1.updateOrderStatusSchema), admin_controller_1.AdminController.updateOrderStatus);
// Customers
router.get('/customers', admin_controller_1.AdminController.getCustomers);
// Profile & Settings
router.get('/profile', admin_controller_1.AdminController.getProfile);
router.put('/profile', admin_controller_1.AdminController.updateProfile);
exports.default = router;
