import mongoose from 'mongoose';
import { Order, Product, RestaurantTable, Tenant, Customer, Notification } from '../models';
import { OrderStatus, TableStatus, NotificationType, ProductAvailability } from '../constants';
import { AppError } from '../middlewares/errorHandler';
import { SocketEmitter } from '../sockets/socketEmitter';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.REJECTED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class OrderService {
  /**
   * Create order from customer QR menu scan
   * Strictly calculates all financials server-side
   */
  static async createOrder(data: {
    restaurantSlug: string;
    tableToken: string;
    customer: { name: string; phone: string; email?: string };
    items: { productId: string; quantity: number }[];
    paymentMethod?: any;
    specialInstructions?: string;
  }) {
    // 1. Resolve Tenant by slug
    const tenant = await Tenant.findOne({ slug: data.restaurantSlug.toLowerCase() });
    if (!tenant) throw new AppError('Restaurant not found', 404, 'TENANT_NOT_FOUND');
    const tenantId = tenant._id as mongoose.Types.ObjectId;

    // 2. Resolve Table by qrToken and verify it belongs to this tenant
    const table = await RestaurantTable.findOne({ qrToken: data.tableToken, tenantId });
    if (!table) throw new AppError('Invalid table QR code for this restaurant', 400, 'INVALID_TABLE');

    // 3. Find or Create Customer
    let customer = await Customer.findOne({ tenantId, phone: data.customer.phone });
    if (!customer) {
      customer = await Customer.create({
        tenantId,
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email,
        isGuest: true,
      });
    } else if (data.customer.name && customer.name !== data.customer.name) {
      customer.name = data.customer.name;
      await customer.save();
    }

    // 4. Fetch Products from DB and verify tenant ownership & availability
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      tenantId,
    });

    if (dbProducts.length !== data.items.length) {
      throw new AppError('One or more selected products are invalid or belong to another restaurant', 400, 'INVALID_PRODUCTS');
    }

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // 5. Build order items snapshot and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new AppError(`Product not found: ${item.productId}`, 400, 'PRODUCT_NOT_FOUND');

      if (product.availability !== ProductAvailability.AVAILABLE || product.status !== 'ACTIVE') {
        throw new AppError(`Item "${product.name}" is currently unavailable`, 400, 'PRODUCT_UNAVAILABLE');
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id as mongoose.Types.ObjectId,
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
    const orderCount = await Order.countDocuments({ tenantId });
    const orderNumber = `#${1001 + orderCount}`;

    // 8. Create Order Document
    const order = await Order.create({
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
      orderStatus: OrderStatus.NEW,
      specialInstructions: data.specialInstructions,
    });

    // Update table status to ORDER_PLACED
    table.status = TableStatus.ORDER_PLACED;
    await table.save();

    // Create Notification
    const notification = await Notification.create({
      tenantId,
      type: NotificationType.NEW_ORDER,
      title: `New Order ${orderNumber}`,
      message: `Table ${table.tableNumber} placed an order for ₹${totalAmount}`,
      referenceType: 'ORDER',
      referenceId: order._id,
    });

    // Emit Real-Time Socket event to restaurant admin room
    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name phone')
      .populate('tableId', 'tableNumber');

    SocketEmitter.emitNewOrder(tenantId.toString(), populatedOrder);
    SocketEmitter.emitTableStatusUpdate(tenantId.toString(), table);
    SocketEmitter.emitNotification(tenantId.toString(), notification);

    return populatedOrder;
  }

  /**
   * Admin order status update with strict transition validation
   */
  static async updateOrderStatus(tenantId: string, orderId: string, newStatus: OrderStatus) {
    const order = await Order.findOne({ _id: orderId, tenantId })
      .populate('tableId', 'tableNumber status')
      .populate('customerId', 'name phone');

    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    const allowed = VALID_TRANSITIONS[order.orderStatus];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${order.orderStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    order.orderStatus = newStatus;
    if (newStatus === OrderStatus.COMPLETED) {
      order.paymentStatus = 'PAID' as any;
    }
    await order.save();

    // Table state updates based on order status
    if (order.tableId) {
      const table = await RestaurantTable.findById((order.tableId as any)._id);
      if (table) {
        if (newStatus === OrderStatus.ACCEPTED || newStatus === OrderStatus.PREPARING) {
          table.status = TableStatus.OCCUPIED;
        } else if (newStatus === OrderStatus.DELIVERED) {
          table.status = TableStatus.SERVING;
        } else if (newStatus === OrderStatus.COMPLETED) {
          table.status = TableStatus.CLEANING;
        }
        await table.save();
        SocketEmitter.emitTableStatusUpdate(tenantId, table);
      }
    }

    // Emit real-time updates
    SocketEmitter.emitOrderStatusUpdate(tenantId, orderId, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      updatedAt: order.updatedAt,
    });

    return order;
  }

  static async getOrders(tenantId: string, query: { status?: string; page?: number; limit?: number }) {
    const filter: any = { tenantId };
    if (query.status && query.status !== 'ALL') {
      filter.orderStatus = query.status;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name phone')
        .populate('tableId', 'tableNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
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

  static async getOrderById(orderId: string, tenantId?: string) {
    const filter: any = { _id: orderId };
    if (tenantId) filter.tenantId = tenantId;

    const order = await Order.findOne(filter)
      .populate('customerId', 'name phone')
      .populate('tableId', 'tableNumber')
      .populate('tenantId', 'businessName slug phone address logo currency');

    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    return order;
  }

  static async getCustomerOrders(phone: string) {
    const customers = await Customer.find({ phone });
    const customerIds = customers.map((c) => c._id);

    return Order.find({ customerId: { $in: customerIds } })
      .populate('tableId', 'tableNumber')
      .populate('tenantId', 'businessName slug logo')
      .sort({ createdAt: -1 })
      .limit(20);
  }
}
