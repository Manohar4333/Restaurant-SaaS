"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenant = requireTenant;
const constants_1 = require("../constants");
const apiResponse_1 = require("../utils/apiResponse");
function requireTenant(req, res, next) {
    if (!req.user) {
        return apiResponse_1.ApiResponse.unauthorized(res, 'User not authenticated');
    }
    // Super Admin may perform tenant-less operations or specify tenantId via route parameter
    if (req.user.role === constants_1.UserRole.SUPER_ADMIN) {
        // If tenantId is in params or query, Super Admin can inspect it
        if (req.params.tenantId) {
            req.tenantId = req.params.tenantId;
        }
        return next();
    }
    // Admin users MUST have a tenantId associated with their JWT
    if (!req.user.tenantId) {
        return apiResponse_1.ApiResponse.forbidden(res, 'No tenant associated with this account', 'NO_TENANT_CONTEXT');
    }
    // Strictly enforce tenant context from authenticated user
    req.tenantId = req.user.tenantId;
    next();
}
