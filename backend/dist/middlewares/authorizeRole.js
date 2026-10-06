"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = authorizeRole;
const apiResponse_1 = require("../utils/apiResponse");
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return apiResponse_1.ApiResponse.unauthorized(res, 'User not authenticated');
        }
        if (!allowedRoles.includes(req.user.role)) {
            return apiResponse_1.ApiResponse.forbidden(res, `Access denied. Role ${req.user.role} is not permitted to perform this action.`, 'FORBIDDEN_ROLE');
        }
        next();
    };
}
