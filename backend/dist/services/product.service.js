"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middlewares/errorHandler");
const constants_1 = require("../constants");
class ProductService {
    static async getProducts(tenantId, query) {
        const filter = { tenantId };
        if (query.categoryId)
            filter.categoryId = query.categoryId;
        if (query.availability)
            filter.availability = query.availability;
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            models_1.Product.find(filter)
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            models_1.Product.countDocuments(filter),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async createProduct(tenantId, data) {
        // Verify category belongs to same tenant
        const category = await models_1.Category.findOne({ _id: data.categoryId, tenantId });
        if (!category) {
            throw new errorHandler_1.AppError('Invalid category for this restaurant', 400, 'INVALID_CATEGORY');
        }
        return models_1.Product.create({
            ...data,
            tenantId,
        });
    }
    static async getProductById(tenantId, productId) {
        const product = await models_1.Product.findOne({ _id: productId, tenantId }).populate('categoryId', 'name');
        if (!product)
            throw new errorHandler_1.AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
        return product;
    }
    static async updateProduct(tenantId, productId, data) {
        if (data.categoryId) {
            const category = await models_1.Category.findOne({ _id: data.categoryId, tenantId });
            if (!category) {
                throw new errorHandler_1.AppError('Invalid category for this restaurant', 400, 'INVALID_CATEGORY');
            }
        }
        const product = await models_1.Product.findOneAndUpdate({ _id: productId, tenantId }, { $set: data }, { new: true, runValidators: true });
        if (!product)
            throw new errorHandler_1.AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
        return product;
    }
    static async toggleAvailability(tenantId, productId, availability) {
        const product = await models_1.Product.findOne({ _id: productId, tenantId });
        if (!product)
            throw new errorHandler_1.AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        const newStatus = availability || (product.availability === constants_1.ProductAvailability.AVAILABLE
            ? constants_1.ProductAvailability.UNAVAILABLE
            : constants_1.ProductAvailability.AVAILABLE);
        product.availability = newStatus;
        await product.save();
        return product;
    }
    static async deleteProduct(tenantId, productId) {
        const product = await models_1.Product.findOneAndDelete({ _id: productId, tenantId });
        if (!product)
            throw new errorHandler_1.AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
        return true;
    }
}
exports.ProductService = ProductService;
