"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, message = 'Success', data, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data: data ?? null
        });
    }
    static created(res, message = 'Created successfully', data) {
        return this.success(res, message, data, 201);
    }
    static error(res, message = 'An error occurred', code = 'INTERNAL_ERROR', statusCode = 500, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            code,
            ...(errors ? { errors } : {})
        });
    }
    static badRequest(res, message = 'Bad request', code = 'BAD_REQUEST', errors) {
        return this.error(res, message, code, 400, errors);
    }
    static unauthorized(res, message = 'Unauthorized', code = 'UNAUTHORIZED') {
        return this.error(res, message, code, 401);
    }
    static forbidden(res, message = 'Access denied', code = 'FORBIDDEN') {
        return this.error(res, message, code, 403);
    }
    static notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
        return this.error(res, message, code, 404);
    }
    static conflict(res, message = 'Resource already exists', code = 'CONFLICT') {
        return this.error(res, message, code, 409);
    }
}
exports.ApiResponse = ApiResponse;
