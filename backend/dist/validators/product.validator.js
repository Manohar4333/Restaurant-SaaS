"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().min(1, 'Category is required'),
        name: zod_1.z.string().min(1, 'Product name is required'),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0, 'Price must be greater than or equal to 0'),
        image: zod_1.z.string().optional(),
        stock: zod_1.z.number().optional(),
        availability: zod_1.z.nativeEnum(constants_1.ProductAvailability).default(constants_1.ProductAvailability.AVAILABLE),
        isPopular: zod_1.z.boolean().optional(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().min(0).optional(),
        image: zod_1.z.string().optional(),
        stock: zod_1.z.number().optional(),
        availability: zod_1.z.nativeEnum(constants_1.ProductAvailability).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
        isPopular: zod_1.z.boolean().optional(),
    }),
});
