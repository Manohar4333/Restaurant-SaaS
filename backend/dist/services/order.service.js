"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const errorHandler_1 = require("../middlewares/errorHandler");
const socketEmitter_1 = require("../sockets/socketEmitter");
const VALID_TRANSITIONS = {
    [constants_1.OrderStatus.NEW]: [constants_1.OrderStatus.ACCEPTED, constants_1.OrderStatus.REJECTED, constants_1.OrderStatus.CANCELLED],
    [constants_1.OrderStatus.ACCEPTED]: [constants_1.OrderStatus.PREPARING, constants_1.OrderStatus.CANCELLED],
    [constants_1.OrderStatus.PREPARING]: [constants_1.OrderStatus.READY],
    [constants_1.OrderStatus.READY]: [constants_1.OrderStatus.DELIVERED],
    [constants_1.OrderStatus.DELIVERED]: [constants_1.OrderStatus.COMPLETED],
    [constants_1.OrderStatus.COMPLETED]: [],
    [constants_1.OrderStatus.REJECTED]: [],
    [constants_1.OrderStatus.CANCELLED]: [],
};
class OrderService {
    /**
     * Create order from customer QR menu scan
     * Strictly calculates all financials server-side
     */
    static async createOrder(data) {
        // 1. Resolve Tenant by slug
        const tenant = await models_1.Tenant.findOne({ slug: data.restaurantSlug.toLowerCase() });
        if (!tenant)
            throw new errorHandler_1.AppError('Restaurant not found', 404, 'TENANT_NOT_FOUND');
        const tenantId = tenant._id;
        // 2. Resolve Table by qrToken and verify it belongs to this tenant
        const table = await models_1.RestaurantTable.findOne({ qrToken: data.tableToken, tenantId });
        if (!table)
            throw new errorHandler_1.AppError('Invalid table QR code for this restaurant', 400, 'INVALID_TABLE');
        // 3. Find or Create Customer
        let customer = await models_1.Customer.findOne({ tenantId, phone: data.customer.phone });
        if (!customer) {
            customer = await models_1.Customer.create({
                tenantId,
                name: data.customer.name,
                phone: data.customer.phone,
                email: data.customer.email,
                isGuest: true,
            });
        }
        else if (data.customer.name && customer.name !== data.customer.name) {
            customer.name = data.customer.name;
            await customer.save();
        }
        // 4. Fetch Products from DB and verify tenant ownership & availability
        const productIds = data.items.map((i) => i.productId);
        const dbProducts = await models_1.Product.find({
            _id: { $in: productIds },
            tenantId,
        });
        if (dbProducts.length !== data.items.length) {
            throw new errorHandler_1.AppError('One or more selected products are invalid or belong to another restaurant', 400, 'INVALID_PRODUCTS');
        }
        const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
        // 5. Build order items snapshot and calculate subtotal
        let subtotal = 0;
        const orderItems = [];
        for (const item of data.items) {
            const product = productMap.get(item.productId);
            if (!product)
                throw new errorHandler_1.AppError(`Product not found: ${item.productId}`, 400, 'PRODUCT_NOT_FOUND');
            if (product.availability !== constants_1.ProductAvailability.AVAILABLE || product.status !== 'ACTIVE') {
                throw new errorHandler_1.AppError(`Item "${product.name}" is currently unavailable`, 400, 'PRODUCT_UNAVAILABLE');
            }
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                productId: product._id,
                productName: product.name,
                price: product.price, // Database source of truth snapshot
                quantity: item.quantity,
                subtotal: itemSubtotal,
            });
        }
        // 6. Calculate Tax & Total
        const taxRate = tenant.taxPercentage || 0;
        const tax = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
        const totalAmount = Math.round((subtotal + tax) * 100) / 100;
        // 7. Generate Sequential Order Number
        const orderCount = await models_1.Order.countDocuments({ tenantId });
        const orderNumber = `#${1001 + orderCount}`;
        // 8. Create Order Document
        const order = await models_1.Order.create({
            orderNumber,
            tenantId,
            customerId: customer._id,
            tableId: table._id,
            items: orderItems,
            subtotal,
            tax,
            discount: 0,
            totalAmount,
            paymentMethod: data.paymentMethod,
            orderStatus: constants_1.OrderStatus.NEW,
            specialInstructions: data.specialInstructions,
        });
        // Update table status to ORDER_PLACED
        table.status = constants_1.TableStatus.ORDER_PLACED;
        await table.save();
        // Create Notification
        const notification = await models_1.Notification.create({
            tenantId,
            type: constants_1.NotificationType.NEW_ORDER,
            title: `New Order ${orderNumber}`,
            message: `Table ${table.tableNumber} placed an order for ₹${totalAmount}`,
            referenceType: 'ORDER',
            referenceId: order._id,
        });
        // Emit Real-Time Socket event to restaurant admin room
        const populatedOrder = await models_1.Order.findById(order._id)
            .populate('customerId', 'name phone')
            .populate('tableId', 'tableNumber');
        socketEmitter_1.SocketEmitter.emitNewOrder(tenantId.toString(), populatedOrder);
        socketEmitter_1.SocketEmitter.emitTableStatusUpdate(tenantId.toString(), table);
        socketEmitter_1.SocketEmitter.emitNotification(tenantId.toString(), notification);
        return populatedOrder;
    }
    /**
     * Admin order status update with strict transition validation
     */
    static async updateOrderStatus(tenantId, orderId, newStatus) {
        const order = await models_1.Order.findOne({ _id: orderId, tenantId })
            .populate('tableId', 'tableNumber status')
            .populate('customerId', 'name phone');
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        const allowed = VALID_TRANSITIONS[order.orderStatus];
        if (!allowed.includes(newStatus)) {
            throw new errorHandler_1.AppError(`Invalid status transition from ${order.orderStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`, 400, 'INVALID_STATUS_TRANSITION');
        }
        order.orderStatus = newStatus;
        if (newStatus === constants_1.OrderStatus.COMPLETED) {
            order.paymentStatus = 'PAID';
        }
        await order.save();
        // Table state updates based on order status
        if (order.tableId) {
            const table = await models_1.RestaurantTable.findById(order.tableId._id);
            if (table) {
                if (newStatus === constants_1.OrderStatus.ACCEPTED || newStatus === constants_1.OrderStatus.PREPARING) {
                    table.status = constants_1.TableStatus.OCCUPIED;
                }
                else if (newStatus === constants_1.OrderStatus.DELIVERED) {
                    table.status = constants_1.TableStatus.SERVING;
                }
                else if (newStatus === constants_1.OrderStatus.COMPLETED) {
                    table.status = constants_1.TableStatus.CLEANING;
                }
                await table.save();
                socketEmitter_1.SocketEmitter.emitTableStatusUpdate(tenantId, table);
            }
        }
        // Emit real-time updates
        socketEmitter_1.SocketEmitter.emitOrderStatusUpdate(tenantId, orderId, {
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            updatedAt: order.updatedAt,
        });
        return order;
    }
    static async getOrders(tenantId, query) {
        const filter = { tenantId };
        if (query.status && query.status !== 'ALL') {
            filter.orderStatus = query.status;
        }
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            models_1.Order.find(filter)
                .populate('customerId', 'name phone')
                .populate('tableId', 'tableNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            models_1.Order.countDocuments(filter),
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
    static async getOrderById(orderId, tenantId) {
        const filter = { _id: orderId };
        if (tenantId)
            filter.tenantId = tenantId;
        const order = await models_1.Order.findOne(filter)
            .populate('customerId', 'name phone')
            .populate('tableId', 'tableNumber')
            .populate('tenantId', 'businessName slug phone address logo currency');
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        return order;
    }
    static async getCustomerOrders(phone) {
        const customers = await models_1.Customer.find({ phone });
        const customerIds = customers.map((c) => c._id);
        return models_1.Order.find({ customerId: { $in: customerIds } })
            .populate('tableId', 'tableNumber')
            .populate('tenantId', 'businessName slug logo')
            .sort({ createdAt: -1 })
            .limit(20);
    }
}
exports.OrderService = OrderService;
