"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        restaurantSlug: zod_1.z.string().min(1, 'Restaurant identifier is required'),
        tableToken: zod_1.z.string().min(1, 'Table token is required'),
        customer: zod_1.z.object({
            name: zod_1.z.string().min(1, 'Customer name is required'),
            phone: zod_1.z.string().min(6, 'Valid phone number is required'),
            email: zod_1.z.string().email().optional(),
        }),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().min(1, 'Product ID is required'),
            quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
        })).min(1, 'Order must contain at least 1 item'),
        paymentMethod: zod_1.z.nativeEnum(constants_1.OrderPaymentMethod).default(constants_1.OrderPaymentMethod.PAY_AT_RESTAURANT),
        specialInstructions: zod_1.z.string().max(500).optional(),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(constants_1.OrderStatus),
    }),
});
