import { getIO } from './socketServer';

export class SocketEmitter {
  /**
   * Emit new order to specific tenant's admin room
   */
  static emitNewOrder(tenantId: string, orderData: any) {
    try {
      const io = getIO();
      io.to(`tenant:${tenantId}`).emit('order:new', orderData);
    } catch (err) {
      console.warn('[SocketEmitter] Failed to emit order:new event:', err);
    }
  }

  /**
   * Emit order status update to both tenant admin and customer tracking room
   */
  static emitOrderStatusUpdate(tenantId: string, orderId: string, updateData: any) {
    try {
      const io = getIO();
      // Notify Admin dashboard
      io.to(`tenant:${tenantId}`).emit('order:status_updated', updateData);
      // Notify specific Customer tracking screen
      io.to(`order:${orderId}`).emit('order:status_change', updateData);
    } catch (err) {
      console.warn('[SocketEmitter] Failed to emit order status updates:', err);
    }
  }

  /**
   * Emit table status updates to tenant admin room
   */
  static emitTableStatusUpdate(tenantId: string, tableData: any) {
    try {
      const io = getIO();
      io.to(`tenant:${tenantId}`).emit('table:status_updated', tableData);
    } catch (err) {
      console.warn('[SocketEmitter] Failed to emit table status:', err);
    }
  }

  /**
   * Emit notification to tenant admin room
   */
  static emitNotification(tenantId: string, notification: any) {
    try {
      const io = getIO();
      io.to(`tenant:${tenantId}`).emit('notification:new', notification);
    } catch (err) {
      console.warn('[SocketEmitter] Failed to emit notification:', err);
    }
  }
}
