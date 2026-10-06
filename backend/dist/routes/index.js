"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const platform_routes_1 = __importDefault(require("./platform.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const public_routes_1 = __importDefault(require("./public.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const router = (0, express_1.Router)();
// Versioned /api/v1 routes
router.use('/auth', auth_routes_1.default);
router.use('/platform', platform_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/public', public_routes_1.default);
router.use('/orders', order_routes_1.default);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'restaurant-saas-backend',
        version: '1.0.0',
    });
});
exports.default = router;
