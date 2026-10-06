"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return apiResponse_1.ApiResponse.unauthorized(res, 'Authentication token is missing', 'NO_TOKEN');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return apiResponse_1.ApiResponse.unauthorized(res, 'Invalid or expired authentication token', 'INVALID_TOKEN');
    }
}
