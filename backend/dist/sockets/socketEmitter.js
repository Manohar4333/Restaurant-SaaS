"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEmitter = void 0;
const socketServer_1 = require("./socketServer");
class SocketEmitter {
    /**
     * Emit new order to specific tenant's admin room
     */
    static emitNewOrder(tenantId, orderData) {
        try {
            const io = (0, socketServer_1.getIO)();
            io.to(`tenant:${tenantId}`).emit('order:new', orderData);
        }
        catch (err) {
            console.warn('[SocketEmitter] Failed to emit order:new event:', err);
        }
    }
    /**
     * Emit order status update to both tenant admin and customer tracking room
     */
    static emitOrderStatusUpdate(tenantId, orderId, updateData) {
        try {
            const io = (0, socketServer_1.getIO)();
            // Notify Admin dashboard
            io.to(`tenant:${tenantId}`).emit('order:status_updated', updateData);
            // Notify specific Customer tracking screen
            io.to(`order:${orderId}`).emit('order:status_change', updateData);
        }
        catch (err) {
            console.warn('[SocketEmitter] Failed to emit order status updates:', err);
        }
    }
    /**
     * Emit table status updates to tenant admin room
     */
    static emitTableStatusUpdate(tenantId, tableData) {
        try {
            const io = (0, socketServer_1.getIO)();
            io.to(`tenant:${tenantId}`).emit('table:status_updated', tableData);
        }
        catch (err) {
            console.warn('[SocketEmitter] Failed to emit table status:', err);
        }
    }
    /**
     * Emit notification to tenant admin room
     */
    static emitNotification(tenantId, notification) {
        try {
            const io = (0, socketServer_1.getIO)();
            io.to(`tenant:${tenantId}`).emit('notification:new', notification);
        }
        catch (err) {
            console.warn('[SocketEmitter] Failed to emit notification:', err);
        }
    }
}
exports.SocketEmitter = SocketEmitter;
