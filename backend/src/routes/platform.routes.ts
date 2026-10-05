import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { UserRole } from '../constants';
import { validateRequest } from '../middlewares/validateRequest';
import { createTenantSchema, updateTenantSchema } from '../validators/tenant.validator';

const router = Router();

// Strictly guard all /platform/* endpoints to SUPER_ADMIN only
router.use(authenticate, authorizeRole(UserRole.SUPER_ADMIN));

// Platform Dashboard
router.get('/dashboard', PlatformController.getDashboard);

// Tenant Management
router.get('/tenants', PlatformController.getTenants);
router.post('/tenants', validateRequest(createTenantSchema), PlatformController.createTenant);
router.get('/tenants/:id', PlatformController.getTenantById);
router.put('/tenants/:id', validateRequest(updateTenantSchema), PlatformController.updateTenant);
router.patch('/tenants/:id/activate', PlatformController.activateTenant);
router.patch('/tenants/:id/suspend', PlatformController.suspendTenant);

// Subscription Plans
router.get('/plans', PlatformController.getPlans);
router.post('/plans', PlatformController.createPlan);
router.put('/plans/:id', PlatformController.updatePlan);
router.delete('/plans/:id', PlatformController.deletePlan);

// Subscriptions & Payments Overview
router.get('/subscriptions', PlatformController.getSubscriptions);
router.get('/payments', PlatformController.getPayments);

export default router;
