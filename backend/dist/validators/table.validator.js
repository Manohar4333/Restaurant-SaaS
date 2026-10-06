"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTableSchema = exports.createTableSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
exports.createTableSchema = zod_1.z.object({
    body: zod_1.z.object({
        tableNumber: zod_1.z.string().min(1, 'Table number is required'),
        capacity: zod_1.z.number().min(1, 'Capacity must be at least 1').default(4),
    }),
});
exports.updateTableSchema = zod_1.z.object({
    body: zod_1.z.object({
        tableNumber: zod_1.z.string().optional(),
        capacity: zod_1.z.number().min(1).optional(),
        status: zod_1.z.nativeEnum(constants_1.TableStatus).optional(),
    }),
});
