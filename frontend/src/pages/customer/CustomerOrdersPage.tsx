import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [phone, setPhone] = useState(() => localStorage.getItem('customer_phone') || '');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = (targetPhone?: string) => {
    const p = targetPhone || phone;
    if (!p) return;
    setIsLoading(true);
    api
      .get(`/orders/my-orders?phone=${p}`)
      .then((res) => setOrders(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (phone) fetchOrders(phone);
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Your Recent Orders</h1>
        <p className="text-xs text-slate-500">Track current dining or past visits</p>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number..."
          className="flex-1 bg-transparent text-xs focus:outline-none"
        />
        <Button size="sm" variant="primary" onClick={() => fetchOrders()}>
          Look Up
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Searching orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No orders found for this phone number.</div>
        ) : (
          orders.map((o) => (
            <Link
              key={o._id}
              to={`/order/${o._id}`}
              className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 text-sm">{o.orderNumber}</span>
                <Badge variant={o.orderStatus === 'COMPLETED' ? 'success' : 'warning'}>{o.orderStatus}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-2">{o.tenantId?.businessName} • Table {o.tableId?.tableNumber}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                <span className="text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                <span className="font-black text-slate-900">₹{o.totalAmount} →</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
