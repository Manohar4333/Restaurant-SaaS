import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { requireTenant } from '../middlewares/requireTenant';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';
import { UserRole } from '../constants';
import { validateRequest } from '../middlewares/validateRequest';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { createTableSchema, updateTableSchema } from '../validators/table.validator';
import { updateOrderStatusSchema } from '../validators/order.validator';
import { createSubscriptionPaymentSchema, verifyPaymentSchema } from '../validators/payment.validator';

const router = Router();

// Base middleware for all admin endpoints: must be authenticated ADMIN belonging to a tenant
router.use(authenticate, authorizeRole(UserRole.ADMIN), requireTenant);

// Subscription & Payments (Accessible even when suspended so admin can pay!)
router.get('/subscription', AdminController.getSubscription);
router.get('/payments', AdminController.getPayments);
router.post('/subscription/create-payment', validateRequest(createSubscriptionPaymentSchema), AdminController.createSubscriptionPayment);
router.post('/subscription/verify-payment', validateRequest(verifyPaymentSchema), AdminController.verifyPayment);

// All routes below require ACTIVE subscription status
router.use(requireActiveSubscription);

// Dashboard & Reports
router.get('/dashboard', AdminController.getDashboard);
router.get('/reports/sales', AdminController.getSalesReport);

// Categories
router.get('/categories', AdminController.getCategories);
router.post('/categories', validateRequest(createCategorySchema), AdminController.createCategory);
router.put('/categories/:id', validateRequest(updateCategorySchema), AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// Products
router.get('/products', AdminController.getProducts);
router.post('/products', validateRequest(createProductSchema), AdminController.createProduct);
router.get('/products/:id', AdminController.getProductById);
router.put('/products/:id', validateRequest(updateProductSchema), AdminController.updateProduct);
router.patch('/products/:id/availability', AdminController.toggleProductAvailability);
router.delete('/products/:id', AdminController.deleteProduct);

// Tables
router.get('/tables', AdminController.getTables);
router.post('/tables', validateRequest(createTableSchema), AdminController.createTable);
router.put('/tables/:id', validateRequest(updateTableSchema), AdminController.updateTable);
router.delete('/tables/:id', AdminController.deleteTable);
router.get('/tables/:id/qr', AdminController.getTableQR);

// Orders
router.get('/orders', AdminController.getOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), AdminController.updateOrderStatus);

// Customers
router.get('/customers', AdminController.getCustomers);

// Profile & Settings
router.get('/profile', AdminController.getProfile);
router.put('/profile', AdminController.updateProfile);

export default router;
