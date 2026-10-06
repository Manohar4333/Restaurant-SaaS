"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middlewares/errorHandler");
class CategoryService {
    static async getCategories(tenantId, status) {
        const filter = { tenantId };
        if (status)
            filter.status = status;
        return models_1.Category.find(filter).sort({ sortOrder: 1, name: 1 });
    }
    static async createCategory(tenantId, data) {
        return models_1.Category.create({
            ...data,
            tenantId,
        });
    }
    static async getCategoryById(tenantId, categoryId) {
        const category = await models_1.Category.findOne({ _id: categoryId, tenantId });
        if (!category)
            throw new errorHandler_1.AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        return category;
    }
    static async updateCategory(tenantId, categoryId, data) {
        const category = await models_1.Category.findOneAndUpdate({ _id: categoryId, tenantId }, { $set: data }, { new: true, runValidators: true });
        if (!category)
            throw new errorHandler_1.AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        return category;
    }
    static async deleteCategory(tenantId, categoryId) {
        const category = await models_1.Category.findOneAndDelete({ _id: categoryId, tenantId });
        if (!category)
            throw new errorHandler_1.AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        return true;
    }
}
exports.CategoryService = CategoryService;
