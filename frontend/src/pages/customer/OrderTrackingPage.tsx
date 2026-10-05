import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useSocket } from '../../contexts/SocketContext';
import { CheckCircle2, Clock, ChefHat, Bike, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const ORDER_STEPS = [
  { key: 'NEW', label: 'Order Placed', desc: 'Sent to restaurant kitchen' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Order confirmed by restaurant' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Chefs are cooking your meal' },
  { key: 'READY', label: 'Ready', desc: 'Freshly prepared and plated' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Served at your table' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Hope you enjoyed your meal!' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();

  const fetchOrder = () => {
    if (!orderId) return;
    api
      .get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Join order room for real-time live timeline updates
  useEffect(() => {
    if (!orderId) return;
    joinOrderRoom(orderId);

    if (socket) {
      const handleStatusChange = (data: any) => {
        if (data.orderId === orderId) {
          fetchOrder();
        }
      };
      socket.on('order:status_change', handleStatusChange);
      return () => {
        socket.off('order:status_change', handleStatusChange);
        leaveOrderRoom(orderId);
      };
    }
  }, [orderId, socket]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading order timeline...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="p-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
        <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
          Live Order Status
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{order.orderNumber}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {order.tenantId?.businessName} • Table: <strong className="text-orange-600">{order.tableId?.tableNumber}</strong>
        </p>
      </div>

      {/* Real-time Stepper Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 text-sm">Order Progress</h3>
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {ORDER_STEPS.map((step, idx) => {
            const isDone = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-4 ring-white transition-all ${
                    isCurrent
                      ? 'bg-orange-600 ring-orange-100 animate-pulse'
                      : isDone
                      ? 'bg-emerald-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-bold leading-tight ${
                      isCurrent ? 'text-orange-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Dishes in this order</h3>
        <div className="space-y-2 text-xs divide-y divide-slate-50">
          {order.items.map((i: any, idx: number) => (
            <div key={idx} className="pt-2 flex justify-between">
              <span>{i.quantity}× {i.productName}</span>
              <span className="font-bold text-slate-900">₹{i.subtotal}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between font-black text-sm text-slate-900">
          <span>Total Paid / Payable</span>
          <span className="text-orange-600">₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};
