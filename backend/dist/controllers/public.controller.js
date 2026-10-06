"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler_1 = require("../middlewares/errorHandler");
class PublicController {
    static async getRestaurantBySlug(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findOne({ slug: req.params.slug.toLowerCase() });
            if (!tenant)
                throw new errorHandler_1.AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
            return apiResponse_1.ApiResponse.success(res, 'Restaurant info fetched', {
                id: tenant._id,
                businessName: tenant.businessName,
                slug: tenant.slug,
                address: tenant.address,
                phone: tenant.phone,
                logo: tenant.logo,
                currency: tenant.currency,
                taxPercentage: tenant.taxPercentage,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategories(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findOne({ slug: req.params.slug.toLowerCase() });
            if (!tenant)
                throw new errorHandler_1.AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
            const categories = await models_1.Category.find({ tenantId: tenant._id, status: 'ACTIVE' }).sort({ sortOrder: 1, name: 1 });
            return apiResponse_1.ApiResponse.success(res, 'Categories fetched', categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProducts(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findOne({ slug: req.params.slug.toLowerCase() });
            if (!tenant)
                throw new errorHandler_1.AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
            const filter = {
                tenantId: tenant._id,
                status: 'ACTIVE',
            };
            if (req.query.categoryId) {
                filter.categoryId = req.query.categoryId;
            }
            if (req.query.search) {
                filter.name = { $regex: req.query.search, $options: 'i' };
            }
            const products = await models_1.Product.find(filter).populate('categoryId', 'name').sort({ name: 1 });
            return apiResponse_1.ApiResponse.success(res, 'Products fetched', products);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductDetails(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findOne({ slug: req.params.slug.toLowerCase() });
            if (!tenant)
                throw new errorHandler_1.AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
            const product = await models_1.Product.findOne({ _id: req.params.id, tenantId: tenant._id }).populate('categoryId', 'name');
            if (!product)
                throw new errorHandler_1.AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
            return apiResponse_1.ApiResponse.success(res, 'Product details fetched', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTableByToken(req, res, next) {
        try {
            const tenant = await models_1.Tenant.findOne({ slug: req.params.slug.toLowerCase() });
            if (!tenant)
                throw new errorHandler_1.AppError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
            const table = await models_1.RestaurantTable.findOne({ qrToken: req.params.qrToken, tenantId: tenant._id });
            if (!table)
                throw new errorHandler_1.AppError('Table QR token is invalid', 404, 'INVALID_TABLE');
            return apiResponse_1.ApiResponse.success(res, 'Table identified', {
                id: table._id,
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                status: table.status,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PublicController = PublicController;
