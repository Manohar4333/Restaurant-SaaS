import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useSocket } from '../../contexts/SocketContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Clock, CheckCircle2, XCircle, ChefHat, Bike, Check, RefreshCw } from 'lucide-react';

const STATUS_FILTERS = [
  'ALL',
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const { socket } = useSocket();

  const fetchOrders = () => {
    setIsLoading(true);
    api
      .get(`/admin/orders?status=${activeFilter}`)
      .then((res) => setOrders(res.data.data.items))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleOrderChange = () => {
      fetchOrders();
    };

    socket.on('order:new', handleOrderChange);
    socket.on('order:status_updated', handleOrderChange);

    return () => {
      socket.off('order:new', handleOrderChange);
      socket.off('order:status_updated', handleOrderChange);
    };
  }, [socket, activeFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Kitchen & Table Orders</h1>
          <p className="text-sm text-slate-500">Real-time status transitions from kitchen prep to table service</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} isLoading={isLoading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === status
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-950/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No orders found under {activeFilter} status.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {order.orderNumber}
                  </span>
                  <Badge
                    variant={
                      order.orderStatus === 'NEW'
                        ? 'warning'
                        : order.orderStatus === 'COMPLETED'
                        ? 'success'
                        : order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED'
                        ? 'danger'
                        : 'info'
                    }
                  >
                    {order.orderStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    Table: {order.tableId?.tableNumber || 'N/A'}
                  </span>
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-slate-700">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong className="text-slate-900">{item.quantity}×</strong> {item.productName}
                      </span>
                      <span className="font-semibold text-slate-900">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <p className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded-lg mb-4 border border-amber-200">
                    Note: {order.specialInstructions}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Customer</p>
                    <p className="text-xs font-bold text-slate-800">{order.customerId?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium">Grand Total</p>
                    <p className="text-base font-extrabold text-slate-900">₹{order.totalAmount}</p>
                  </div>
                </div>

                {/* State Machine Action Buttons */}
                <div className="space-y-2">
                  {order.orderStatus === 'NEW' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => updateStatus(order._id, 'ACCEPTED')}
                      >
                        Accept Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => updateStatus(order._id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {order.orderStatus === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => updateStatus(order._id, 'PREPARING')}
                    >
                      <ChefHat className="w-3.5 h-3.5 mr-1" />
                      Start Preparing
                    </Button>
                  )}

                  {order.orderStatus === 'PREPARING' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateStatus(order._id, 'READY')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Mark Ready
                    </Button>
                  )}

                  {order.orderStatus === 'READY' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => updateStatus(order._id, 'DELIVERED')}
                    >
                      <Bike className="w-3.5 h-3.5 mr-1" />
                      Mark Delivered to Table
                    </Button>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateStatus(order._id, 'COMPLETED')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Bill Paid & Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
