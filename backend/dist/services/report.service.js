"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const constants_1 = require("../constants");
class ReportService {
    /**
     * Restaurant Admin Dashboard and Sales Reports via MongoDB Aggregations
     */
    static async getAdminDashboardMetrics(tenantId) {
        const objectId = new mongoose_1.default.Types.ObjectId(tenantId);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [todayStats, orderStatusCounts, productStats, tableStats, customerCount, recentOrders,] = await Promise.all([
            // Today revenue and order count
            models_1.Order.aggregate([
                {
                    $match: {
                        tenantId: objectId,
                        createdAt: { $gte: startOfToday },
                        orderStatus: { $nin: [constants_1.OrderStatus.CANCELLED, constants_1.OrderStatus.REJECTED] },
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
            models_1.Order.aggregate([
                { $match: { tenantId: objectId } },
                {
                    $group: {
                        _id: '$orderStatus',
                        count: { $sum: 1 },
                    },
                },
            ]),
            // Product counts
            models_1.Product.aggregate([
                { $match: { tenantId: objectId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
            // Table counts
            models_1.RestaurantTable.aggregate([
                { $match: { tenantId: objectId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
            // Customer count
            models_1.Customer.countDocuments({ tenantId: objectId }),
            // 5 most recent orders
            models_1.Order.find({ tenantId: objectId })
                .populate('customerId', 'name phone')
                .populate('tableId', 'tableNumber')
                .sort({ createdAt: -1 })
                .limit(5),
        ]);
        const statusMap = new Map(orderStatusCounts.map((s) => [s._id, s.count]));
        const tableStatusMap = new Map(tableStats.map((t) => [t._id, t.count]));
        return {
            todayRevenue: todayStats[0]?.totalRevenue || 0,
            todayOrders: todayStats[0]?.orderCount || 0,
            pendingOrders: statusMap.get(constants_1.OrderStatus.NEW) || 0,
            preparingOrders: statusMap.get(constants_1.OrderStatus.PREPARING) || 0,
            readyOrders: statusMap.get(constants_1.OrderStatus.READY) || 0,
            completedOrders: statusMap.get(constants_1.OrderStatus.COMPLETED) || 0,
            totalProducts: productStats.reduce((acc, p) => acc + p.count, 0),
            activeProducts: productStats.find((p) => p._id === 'ACTIVE')?.count || 0,
            totalCustomers: customerCount,
            totalTables: tableStats.reduce((acc, t) => acc + t.count, 0),
            occupiedTables: tableStatusMap.get('OCCUPIED') || tableStatusMap.get('ORDER_PLACED') || 0,
            availableTables: tableStatusMap.get('AVAILABLE') || 0,
            recentOrders,
        };
    }
    /**
     * Admin Sales Trend Aggregations (Daily, Weekly, Monthly)
     */
    static async getAdminSalesReport(tenantId) {
        const objectId = new mongoose_1.default.Types.ObjectId(tenantId);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [dailySales, topProducts] = await Promise.all([
            models_1.Order.aggregate([
                {
                    $match: {
                        tenantId: objectId,
                        createdAt: { $gte: thirtyDaysAgo },
                        orderStatus: { $nin: [constants_1.OrderStatus.CANCELLED, constants_1.OrderStatus.REJECTED] },
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
            models_1.Order.aggregate([
                {
                    $match: {
                        tenantId: objectId,
                        orderStatus: { $nin: [constants_1.OrderStatus.CANCELLED, constants_1.OrderStatus.REJECTED] },
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
        const [tenantStats, subscriptionStats, orderStats, customerCount, revenueStats, monthlyGrowth,] = await Promise.all([
            // Tenant count by status
            models_1.Tenant.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
            // Subscription distribution & MRR
            models_1.Subscription.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        mrr: {
                            $sum: {
                                $cond: [{ $eq: ['$status', constants_1.SubscriptionStatus.ACTIVE] }, '$amount', 0],
                            },
                        },
                    },
                },
            ]),
            // Total orders
            models_1.Order.countDocuments(),
            // Total customers
            models_1.Customer.countDocuments(),
            // Total collected payment revenue
            models_1.Payment.aggregate([
                { $match: { status: 'SUCCESS' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$amount' },
                    },
                },
            ]),
            // Tenant registration growth over last 6 months
            models_1.Tenant.aggregate([
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
        const tenantMap = new Map(tenantStats.map((t) => [t._id, t.count]));
        const totalTenants = tenantStats.reduce((acc, t) => acc + t.count, 0);
        const activeSub = subscriptionStats.find((s) => s._id === constants_1.SubscriptionStatus.ACTIVE);
        return {
            totalTenants,
            activeTenants: tenantMap.get(constants_1.TenantStatus.ACTIVE) || 0,
            suspendedTenants: tenantMap.get(constants_1.TenantStatus.SUSPENDED) || 0,
            expiredSubscriptions: subscriptionStats.find((s) => s._id === constants_1.SubscriptionStatus.EXPIRED)?.count || 0,
            mrr: activeSub?.mrr || 0,
            totalOrders: orderStats,
            totalCustomers: customerCount,
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            monthlyGrowth,
            subscriptionDistribution: subscriptionStats,
        };
    }
}
exports.ReportService = ReportService;
