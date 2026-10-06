"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
class AppError extends Error {
    statusCode;
    code;
    errors;
    constructor(message, statusCode = 400, code = 'BAD_REQUEST', errors) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = {};
        err.errors.forEach((e) => {
            const field = e.path.join('.');
            formattedErrors[field] = e.message;
        });
        return apiResponse_1.ApiResponse.badRequest(res, 'Validation failed', 'VALIDATION_ERROR', formattedErrors);
    }
    // App specific operational errors
    if (err instanceof AppError) {
        return apiResponse_1.ApiResponse.error(res, err.message, err.code, err.statusCode, err.errors);
    }
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const formattedErrors = {};
        for (const key in err.errors) {
            formattedErrors[key] = err.errors[key].message;
        }
        return apiResponse_1.ApiResponse.badRequest(res, 'Database validation error', 'MONGOOSE_VALIDATION_ERROR', formattedErrors);
    }
    // Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        return apiResponse_1.ApiResponse.badRequest(res, `Invalid format for field: ${err.path}`, 'INVALID_ID');
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const fields = Object.keys(err.keyValue || {});
        const fieldName = fields.join(', ');
        return apiResponse_1.ApiResponse.conflict(res, `A record with this ${fieldName} already exists`, 'DUPLICATE_KEY_ERROR');
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return apiResponse_1.ApiResponse.unauthorized(res, 'Invalid token. Please authenticate again.', 'INVALID_TOKEN');
    }
    if (err.name === 'TokenExpiredError') {
        return apiResponse_1.ApiResponse.unauthorized(res, 'Token has expired. Please refresh your session.', 'TOKEN_EXPIRED');
    }
    // Generic fallback
    return apiResponse_1.ApiResponse.error(res, process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message || 'Internal server error', 'INTERNAL_SERVER_ERROR', 500);
}
