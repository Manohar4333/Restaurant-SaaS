import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle,
  Utensils,
  Table as TableIcon,
  Users,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/reports/sales')])
      .then(([dashRes, salesRes]) => {
        setMetrics(dashRes.data.data);
        setSalesReport(salesRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  const statCards = [
    {
      label: "Today's Revenue",
      value: `₹${metrics?.todayRevenue || 0}`,
      sub: `${metrics?.todayOrders || 0} orders today`,
      icon: IndianRupee,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Kitchen Funnel',
      value: `${metrics?.pendingOrders || 0} New`,
      sub: `${metrics?.preparingOrders || 0} Preparing • ${metrics?.readyOrders || 0} Ready`,
      icon: Clock,
      bg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Table Occupancy',
      value: `${metrics?.occupiedTables || 0} / ${metrics?.totalTables || 0}`,
      sub: `${metrics?.availableTables || 0} available for seating`,
      icon: TableIcon,
      bg: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Active Menu Items',
      value: `${metrics?.activeProducts || 0} / ${metrics?.totalProducts || 0}`,
      sub: `${metrics?.totalCustomers || 0} registered customers`,
      icon: Utensils,
      bg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Restaurant Dashboard</h1>
          <p className="text-sm text-slate-500">Live service monitor, active table statuses, and kitchen operations</p>
        </div>
        <Link to="/admin/orders">
          <Button variant="primary">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Manage Live Orders
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Trend & Top Dishes */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Daily Sales (Last 30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [`₹${val}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#ea580c" radius={[6, 6, 0, 0]} name="Sales (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Dishes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Top Selling Dishes
          </h3>
          <div className="space-y-4">
            {(salesReport?.topProducts || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No sales data recorded yet.</p>
            ) : (
              (salesReport?.topProducts || []).map((prod: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm pb-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-800">{prod._id}</p>
                    <p className="text-xs text-slate-400">{prod.quantity} orders sold</p>
                  </div>
                  <span className="font-bold text-slate-900">₹{prod.revenue}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Recent Incoming Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics?.recentOrders || []).map((o: any) => (
                <tr key={o._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900">{o.orderNumber}</td>
                  <td className="px-4 py-3 font-semibold text-orange-600">{o.tableId?.tableNumber}</td>
                  <td className="px-4 py-3">{o.customerId?.name}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">₹{o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.orderStatus === 'NEW' ? 'warning' : 'info'}>{o.orderStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/orders">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
