import mongoose from 'mongoose';
import { Order, Tenant, Subscription, Product, Customer, RestaurantTable, Payment } from '../models';
import { OrderStatus, TenantStatus, SubscriptionStatus } from '../constants';

export class ReportService {
  /**
   * Restaurant Admin Dashboard and Sales Reports via MongoDB Aggregations
   */
  static async getAdminDashboardMetrics(tenantId: string) {
    const objectId = new mongoose.Types.ObjectId(tenantId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayStats,
      orderStatusCounts,
      productStats,
      tableStats,
      customerCount,
      recentOrders,
    ] = await Promise.all([
      // Today revenue and order count
      Order.aggregate([
        {
          $match: {
            tenantId: objectId,
            createdAt: { $gte: startOfToday },
            orderStatus: { $nin: [OrderStatus.CANCELLED, OrderStatus.REJECTED] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
          },
        },
      ]),

      // Count by each order status
      Order.aggregate([
        { $match: { tenantId: objectId } },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // Product counts
      Product.aggregate([
        { $match: { tenantId: objectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Table counts
      RestaurantTable.aggregate([
        { $match: { tenantId: objectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Customer count
      Customer.countDocuments({ tenantId: objectId }),

      // 5 most recent orders
      Order.find({ tenantId: objectId })
        .populate('customerId', 'name phone')
        .populate('tableId', 'tableNumber')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const statusMap = new Map(orderStatusCounts.map((s: any) => [s._id, s.count]));
    const tableStatusMap = new Map(tableStats.map((t: any) => [t._id, t.count]));

    return {
      todayRevenue: todayStats[0]?.totalRevenue || 0,
      todayOrders: todayStats[0]?.orderCount || 0,
      pendingOrders: statusMap.get(OrderStatus.NEW) || 0,
      preparingOrders: statusMap.get(OrderStatus.PREPARING) || 0,
      readyOrders: statusMap.get(OrderStatus.READY) || 0,
      completedOrders: statusMap.get(OrderStatus.COMPLETED) || 0,
      totalProducts: productStats.reduce((acc: number, p: any) => acc + p.count, 0),
      activeProducts: productStats.find((p: any) => p._id === 'ACTIVE')?.count || 0,
      totalCustomers: customerCount,
      totalTables: tableStats.reduce((acc: number, t: any) => acc + t.count, 0),
      occupiedTables: tableStatusMap.get('OCCUPIED') || tableStatusMap.get('ORDER_PLACED') || 0,
      availableTables: tableStatusMap.get('AVAILABLE') || 0,
      recentOrders,
    };
  }

  /**
   * Admin Sales Trend Aggregations (Daily, Weekly, Monthly)
   */
  static async getAdminSalesReport(tenantId: string) {
    const objectId = new mongoose.Types.ObjectId(tenantId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dailySales, topProducts] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            tenantId: objectId,
            createdAt: { $gte: thirtyDaysAgo },
            orderStatus: { $nin: [OrderStatus.CANCELLED, OrderStatus.REJECTED] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top selling products
      Order.aggregate([
        {
          $match: {
            tenantId: objectId,
            orderStatus: { $nin: [OrderStatus.CANCELLED, OrderStatus.REJECTED] },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productName',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return {
      dailySales,
      topProducts,
    };
  }

  /**
   * Super Admin Platform Dashboard Metrics via MongoDB Aggregations
   */
  static async getPlatformDashboardMetrics() {
    const [
      tenantStats,
      subscriptionStats,
      orderStats,
      customerCount,
      revenueStats,
      monthlyGrowth,
    ] = await Promise.all([
      // Tenant count by status
      Tenant.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Subscription distribution & MRR
      Subscription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            mrr: {
              $sum: {
                $cond: [{ $eq: ['$status', SubscriptionStatus.ACTIVE] }, '$amount', 0],
              },
            },
          },
        },
      ]),

      // Total orders
      Order.countDocuments(),

      // Total customers
      Customer.countDocuments(),

      // Total collected payment revenue
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
          },
        },
      ]),

      // Tenant registration growth over last 6 months
      Tenant.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 6 },
      ]),
    ]);

    const tenantMap = new Map(tenantStats.map((t: any) => [t._id, t.count]));
    const totalTenants = tenantStats.reduce((acc: number, t: any) => acc + t.count, 0);
    const activeSub = subscriptionStats.find((s: any) => s._id === SubscriptionStatus.ACTIVE);

    return {
      totalTenants,
      activeTenants: tenantMap.get(TenantStatus.ACTIVE) || 0,
      suspendedTenants: tenantMap.get(TenantStatus.SUSPENDED) || 0,
      expiredSubscriptions: subscriptionStats.find((s: any) => s._id === SubscriptionStatus.EXPIRED)?.count || 0,
      mrr: activeSub?.mrr || 0,
      totalOrders: orderStats,
      totalCustomers: customerCount,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      monthlyGrowth,
      subscriptionDistribution: subscriptionStats,
    };
  }
}
