import { RestaurantTable, Tenant } from '../models';
import { AppError } from '../middlewares/errorHandler';
import { TableStatus } from '../constants';
import { ENV } from '../config/env';

export class TableService {
  static async getTables(tenantId: string) {
    return RestaurantTable.find({ tenantId }).sort({ tableNumber: 1 });
  }

  static async createTable(tenantId: string, data: { tableNumber: string; capacity: number }) {
    const existing = await RestaurantTable.findOne({ tenantId, tableNumber: data.tableNumber });
    if (existing) {
      throw new AppError(`Table number ${data.tableNumber} already exists`, 409, 'TABLE_EXISTS');
    }

    return RestaurantTable.create({
      tenantId,
      tableNumber: data.tableNumber,
      capacity: data.capacity,
    });
  }

  static async getTableById(tenantId: string, tableId: string) {
    const table = await RestaurantTable.findOne({ _id: tableId, tenantId });
    if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND');
    return table;
  }

  static async updateTable(tenantId: string, tableId: string, data: any) {
    if (data.tableNumber) {
      const existing = await RestaurantTable.findOne({
        tenantId,
        tableNumber: data.tableNumber,
        _id: { $ne: tableId },
      });
      if (existing) {
        throw new AppError(`Table number ${data.tableNumber} already exists`, 409, 'TABLE_EXISTS');
      }
    }

    const table = await RestaurantTable.findOneAndUpdate(
      { _id: tableId, tenantId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND');
    return table;
  }

  static async updateTableStatus(tenantId: string, tableId: string, status: TableStatus) {
    const table = await RestaurantTable.findOneAndUpdate(
      { _id: tableId, tenantId },
      { $set: { status } },
      { new: true }
    );
    if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND');
    return table;
  }

  static async deleteTable(tenantId: string, tableId: string) {
    const table = await RestaurantTable.findOneAndDelete({ _id: tableId, tenantId });
    if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND');
    return true;
  }

  static async getTableQR(tenantId: string, tableId: string) {
    const [table, tenant] = await Promise.all([
      RestaurantTable.findOne({ _id: tableId, tenantId }),
      Tenant.findById(tenantId),
    ]);

    if (!table || !tenant) throw new AppError('Table or Restaurant not found', 404, 'NOT_FOUND');

    const qrUrl = `${ENV.FRONTEND_URL}/menu/${tenant.slug}?table=${table.qrToken}`;

    return {
      tableNumber: table.tableNumber,
      qrToken: table.qrToken,
      qrUrl,
      restaurantName: tenant.businessName,
    };
  }
}
