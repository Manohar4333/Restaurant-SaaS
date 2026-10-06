"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableService = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middlewares/errorHandler");
const env_1 = require("../config/env");
class TableService {
    static async getTables(tenantId) {
        return models_1.RestaurantTable.find({ tenantId }).sort({ tableNumber: 1 });
    }
    static async createTable(tenantId, data) {
        const existing = await models_1.RestaurantTable.findOne({ tenantId, tableNumber: data.tableNumber });
        if (existing) {
            throw new errorHandler_1.AppError(`Table number ${data.tableNumber} already exists`, 409, 'TABLE_EXISTS');
        }
        return models_1.RestaurantTable.create({
            tenantId,
            tableNumber: data.tableNumber,
            capacity: data.capacity,
        });
    }
    static async getTableById(tenantId, tableId) {
        const table = await models_1.RestaurantTable.findOne({ _id: tableId, tenantId });
        if (!table)
            throw new errorHandler_1.AppError('Table not found', 404, 'TABLE_NOT_FOUND');
        return table;
    }
    static async updateTable(tenantId, tableId, data) {
        if (data.tableNumber) {
            const existing = await models_1.RestaurantTable.findOne({
                tenantId,
                tableNumber: data.tableNumber,
                _id: { $ne: tableId },
            });
            if (existing) {
                throw new errorHandler_1.AppError(`Table number ${data.tableNumber} already exists`, 409, 'TABLE_EXISTS');
            }
        }
        const table = await models_1.RestaurantTable.findOneAndUpdate({ _id: tableId, tenantId }, { $set: data }, { new: true, runValidators: true });
        if (!table)
            throw new errorHandler_1.AppError('Table not found', 404, 'TABLE_NOT_FOUND');
        return table;
    }
    static async updateTableStatus(tenantId, tableId, status) {
        const table = await models_1.RestaurantTable.findOneAndUpdate({ _id: tableId, tenantId }, { $set: { status } }, { new: true });
        if (!table)
            throw new errorHandler_1.AppError('Table not found', 404, 'TABLE_NOT_FOUND');
        return table;
    }
    static async deleteTable(tenantId, tableId) {
        const table = await models_1.RestaurantTable.findOneAndDelete({ _id: tableId, tenantId });
        if (!table)
            throw new errorHandler_1.AppError('Table not found', 404, 'TABLE_NOT_FOUND');
        return true;
    }
    static async getTableQR(tenantId, tableId) {
        const [table, tenant] = await Promise.all([
            models_1.RestaurantTable.findOne({ _id: tableId, tenantId }),
            models_1.Tenant.findById(tenantId),
        ]);
        if (!table || !tenant)
            throw new errorHandler_1.AppError('Table or Restaurant not found', 404, 'NOT_FOUND');
        const qrUrl = `${env_1.ENV.FRONTEND_URL}/menu/${tenant.slug}?table=${table.qrToken}`;
        return {
            tableNumber: table.tableNumber,
            qrToken: table.qrToken,
            qrUrl,
            restaurantName: tenant.businessName,
        };
    }
}
exports.TableService = TableService;
