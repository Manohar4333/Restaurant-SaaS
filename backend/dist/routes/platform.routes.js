"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platform_controller_1 = require("../controllers/platform.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizeRole_1 = require("../middlewares/authorizeRole");
const constants_1 = require("../constants");
const validateRequest_1 = require("../middlewares/validateRequest");
const tenant_validator_1 = require("../validators/tenant.validator");
const router = (0, express_1.Router)();
// Strictly guard all /platform/* endpoints to SUPER_ADMIN only
router.use(authenticate_1.authenticate, (0, authorizeRole_1.authorizeRole)(constants_1.UserRole.SUPER_ADMIN));
// Platform Dashboard
router.get('/dashboard', platform_controller_1.PlatformController.getDashboard);
// Tenant Management
router.get('/tenants', platform_controller_1.PlatformController.getTenants);
router.post('/tenants', (0, validateRequest_1.validateRequest)(tenant_validator_1.createTenantSchema), platform_controller_1.PlatformController.createTenant);
router.get('/tenants/:id', platform_controller_1.PlatformController.getTenantById);
router.put('/tenants/:id', (0, validateRequest_1.validateRequest)(tenant_validator_1.updateTenantSchema), platform_controller_1.PlatformController.updateTenant);
router.patch('/tenants/:id/activate', platform_controller_1.PlatformController.activateTenant);
router.patch('/tenants/:id/suspend', platform_controller_1.PlatformController.suspendTenant);
// Subscription Plans
router.get('/plans', platform_controller_1.PlatformController.getPlans);
router.post('/plans', platform_controller_1.PlatformController.createPlan);
router.put('/plans/:id', platform_controller_1.PlatformController.updatePlan);
router.delete('/plans/:id', platform_controller_1.PlatformController.deletePlan);
// Subscriptions & Payments Overview
router.get('/subscriptions', platform_controller_1.PlatformController.getSubscriptions);
router.get('/payments', platform_controller_1.PlatformController.getPayments);
exports.default = router;
